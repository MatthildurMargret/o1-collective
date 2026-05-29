#!/usr/bin/env python3
"""
find_operators.py
For each SF company in sf-companies.json:
  1. Use Exa to find their team/about page
  2. Extract all people listed (name + title)
  3. Claude filters for operators (not founders) with European background
Saves incrementally to output/european-operators.json + .csv
"""

import os, json, re, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa
from google import genai
import anthropic
from sf_verify import verify_sf

load_dotenv(Path(__file__).parent.parent / '.env')

exa    = Exa(os.environ['EXA_API_KEY'])
gemini = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
claude = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

IN_JSON  = Path(__file__).parent / 'output' / 'sf-companies.json'
OUT_JSON = Path(__file__).parent / 'output' / 'european-operators.json'
OUT_CSV  = Path(__file__).parent / 'output' / 'european-operators.csv'

CSV_FIELDS = ['name', 'title', 'company', 'company_stage', 'total_funding',
              'european_background', 'linkedin_url', 'team_page_url',
              'location_raw', 'sf_verified', 'location_source']

# ── domain helpers ────────────────────────────────────────────────────────────

def to_domain(website: str) -> str | None:
    website = (website or '').strip().rstrip('/')
    m = re.search(r'(?:https?://)?(?:www\.)?([^/]+)', website)
    return m.group(1).lower() if m else None

# ── find team page via Exa ────────────────────────────────────────────────────

def find_team_page(domain: str) -> list[dict]:
    """
    Returns up to 2 Exa results that look like team/about/people pages.
    """
    try:
        res = exa.search_and_contents(
            'team people about us employees',
            include_domains=[domain],
            type='neural',
            num_results=3,
            text={'max_characters': 6000},
        )
        # Prefer pages whose URL contains team/about/people/company
        scored = []
        for r in res.results:
            score = 0
            path  = (r.url or '').lower()
            if any(k in path for k in ['/team', '/about', '/people', '/company', '/us']):
                score += 2
            if r.text and len(r.text) > 300:
                score += 1
            scored.append((score, r))
        scored.sort(key=lambda x: -x[0])
        return [r for _, r in scored[:2] if r.text]
    except Exception as e:
        print(f'      exa error: {e}')
        return []

# ── Claude: extract European operators ───────────────────────────────────────

EXTRACT_PROMPT = """\
This is a team/about page for {company} ({stage}, {funding}).

Extract people who are likely of EUROPEAN background working here as OPERATORS \
(engineers, product, design, data, marketing, sales, operations, finance, legal — \
NOT founders/CEO/CTO/CFO and NOT investors).

European background signals: distinctly European name (French, German, Scandinavian, \
Dutch, Eastern European, Iberian, Italian, etc.), mention of European city/country, \
European university, or European company in their bio.

Source: {url}

Page text:
{text}

Return a JSON array:
[{{
  "name": "",
  "title": "",
  "european_background": "",
  "linkedin_url": ""
}}]

Only include fields present. If none qualify, return [].
Return ONLY valid JSON."""

def extract_operators(text: str, url: str, company: str,
                      stage: str, funding: str) -> list[dict]:
    if not text or len(text) < 100:
        return []
    try:
        resp = claude.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1536,
            messages=[{'role': 'user', 'content': EXTRACT_PROMPT.format(
                company=company, stage=stage, funding=funding,
                url=url, text=text[:6000]
            )}]
        )
        raw = resp.content[0].text.strip()
        m = re.search(r'\[[\s\S]*\]', raw)
        if m:
            return json.loads(m.group())
    except Exception as e:
        print(f'      claude error: {e}')
    return []

# ── money formatter ───────────────────────────────────────────────────────────

def fmt_money(n) -> str:
    try:
        n = float(n)
        if n >= 1e9: return f'${n/1e9:.1f}B'
        if n >= 1e6: return f'${n/1e6:.1f}M'
        if n >= 1e3: return f'${n/1e3:.0f}K'
        return f'${n:.0f}'
    except Exception:
        return ''

# ── CSV helpers ───────────────────────────────────────────────────────────────

def write_csv(rows: list[dict]):
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction='ignore')
        w.writeheader()
        w.writerows(r for r in rows if r.get('sf_verified') != 'sf_no')

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    companies = json.loads(IN_JSON.read_text())
    print(f'Loaded {len(companies)} companies\n')

    # Resume support: load existing results and skip already-processed companies
    all_operators: list[dict] = []
    done_ids: set[str] = set()
    if OUT_JSON.exists():
        existing = json.loads(OUT_JSON.read_text())
        all_operators = existing.get('results', [])
        done_ids      = set(existing.get('done_ids', []))
        print(f'Resuming — {len(done_ids)} already processed, '
              f'{len(all_operators)} operators found so far\n')

    total = len(companies)
    for i, company in enumerate(companies):
        cid  = company.get('id', '')
        name = company.get('name', '?')

        if cid in done_ids:
            continue

        domain  = to_domain(company.get('website', ''))
        stage   = company.get('latest_deal_type', '')
        funding = fmt_money(company.get('total_funding'))

        print(f'[{i+1}/{total}] {name} ({stage}, {funding})', end=' — ')

        if not domain:
            print('no domain, skip')
            done_ids.add(cid)
            continue

        pages   = find_team_page(domain)
        new_ops = []

        for page in pages:
            ops = extract_operators(
                page.text, page.url, name, stage, funding
            )
            for op in ops:
                if not op.get('name'):
                    continue
                op['company']       = name
                op['company_stage'] = stage
                op['total_funding'] = funding
                op['team_page_url'] = page.url
                new_ops.append(op)

        # Verify SF location and drop anyone clearly not in SF
        sf_ops = []
        for op in new_ops:
            op_name = (op.get('name') or '').strip()
            print(f'      sf-check: {op_name}...', end=' ', flush=True)
            loc = verify_sf(op_name, name, op.get('linkedin_url', ''),
                            exa=exa, gemini=gemini)
            op.update(loc)
            if loc['sf_verified'] == 'sf_no':
                print(f'✗ not SF ({loc["location_raw"]})')
            else:
                print(f'✓ {loc["sf_verified"]} ({loc["location_raw"] or "?"})')
                sf_ops.append(op)
            time.sleep(0.2)

        # Deduplicate within this company by name
        seen_names: set[str] = set()
        for op in sf_ops:
            key = op['name'].lower().strip()
            if key not in seen_names:
                seen_names.add(key)
                all_operators.append(op)

        print(f'{len(sf_ops)}/{len(new_ops)} SF-verified operators')
        done_ids.add(cid)

        # Save after every company
        OUT_JSON.write_text(json.dumps({
            'done_ids': list(done_ids),
            'results':  all_operators,
        }, indent=2))
        write_csv(all_operators)

        time.sleep(0.4)

    # Final summary
    print(f'\n{"─"*45}')
    print(f'Companies processed  : {len(done_ids)}')
    print(f'European operators   : {len(all_operators)}')
    with_li = sum(1 for op in all_operators if op.get('linkedin_url'))
    print(f'With LinkedIn        : {with_li}')
    by_stage: dict[str, int] = {}
    for op in all_operators:
        s = op.get('company_stage', 'unknown')
        by_stage[s] = by_stage.get(s, 0) + 1
    print('\nBy company stage:')
    for s, n in sorted(by_stage.items(), key=lambda x: -x[1]):
        print(f'  {s:<20} {n}')
    print(f'\nOutput: scripts/output/european-operators.csv')

if __name__ == '__main__':
    main()
