#!/usr/bin/env python3
"""
enrich_operators.py
Looks up LinkedIn profiles for every person in european-operators.json.
Uses Exa with quoted name + company for precision.
Saves incrementally — safe to interrupt and re-run.
"""

import os, json, re, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa

load_dotenv(Path(__file__).parent.parent / '.env')
exa = Exa(os.environ['EXA_API_KEY'])

IN_JSON  = Path(__file__).parent / 'output' / 'european-operators.json'
OUT_JSON = Path(__file__).parent / 'output' / 'european-operators.json'
OUT_CSV  = Path(__file__).parent / 'output' / 'european-operators.csv'

CSV_FIELDS = ['name', 'title', 'company', 'company_stage', 'total_funding',
              'european_background', 'linkedin_url', 'team_page_url']

LINKEDIN_RE = re.compile(r'https?://(?:\w+\.)?linkedin\.com/in/[A-Za-z0-9\-_%]+')

def extract_linkedin_url(text: str) -> str | None:
    m = LINKEDIN_RE.search(text or '')
    return m.group(0).rstrip('/') if m else None

def find_linkedin(name: str, company: str) -> str | None:
    last = name.strip().split()[-1].lower()

    # Attempt 1: web search "Full Name" "Company" linkedin
    # — pages mentioning the person often embed their LinkedIn URL
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}" linkedin',
            type='auto',
            num_results=5,
            text={'max_characters': 500},
        )
        for r in res.results:
            if re.search(r'linkedin\.com/in/[^/?]+', r.url):
                combined = ((r.title or '') + ' ' + (r.text or '')).lower()
                if not last or last in combined:
                    return r.url.rstrip('/')
            url = extract_linkedin_url(r.text or '')
            if url:
                return url
    except Exception as e:
        print(f' err1:{e}', end='')

    time.sleep(0.2)

    # Attempt 2: search directly within linkedin.com
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}"',
            include_domains=['linkedin.com'],
            type='auto',
            num_results=3,
            text={'max_characters': 200},
        )
        for r in res.results:
            if not re.search(r'linkedin\.com/in/[^/?]+$', r.url):
                continue
            combined = ((r.title or '') + ' ' + (r.text or '')).lower()
            if not last or last in combined:
                return r.url.rstrip('/')
    except Exception as e:
        print(f' err2:{e}', end='')

    return None

def write_csv(rows: list[dict]):
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

def main():
    data = json.loads(IN_JSON.read_text())
    ops  = data['results']
    total = len(ops)
    print(f'Loaded {total} operators\n')

    for i, op in enumerate(ops):
        if op.get('linkedin_url'):
            continue

        name    = (op.get('name') or '').strip()
        company = (op.get('company') or '').strip()
        if not name:
            continue

        print(f'[{i+1}/{total}] {name} @ {company}...', end=' ', flush=True)
        url = find_linkedin(name, company)
        if url:
            op['linkedin_url'] = url
            print(f'✓ {url}')
        else:
            print('—')

        # Save every 10
        if i % 10 == 0:
            OUT_JSON.write_text(json.dumps(data, indent=2))
            write_csv(ops)

        time.sleep(0.3)

    # Final save
    OUT_JSON.write_text(json.dumps(data, indent=2))
    write_csv(ops)

    found = sum(1 for o in ops if o.get('linkedin_url'))
    print(f'\n{"─"*40}')
    print(f'LinkedIn found : {found}/{total}')
    print(f'Output: scripts/output/european-operators.csv')

if __name__ == '__main__':
    main()
