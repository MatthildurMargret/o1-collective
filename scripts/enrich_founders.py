#!/usr/bin/env python3
"""
enrich_founders.py
Enriches vc-founders.json with LinkedIn URLs and emails.

LinkedIn  — keyword search with quoted name so we get exact matches, not
            semantically similar people (the neural-search trap).
Email     — searches the company's own website for contact/team pages,
            then extracts email patterns from the text.
"""

import os, json, re, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa

load_dotenv(Path(__file__).parent.parent / '.env')
exa = Exa(os.environ['EXA_API_KEY'])

IN_JSON  = Path(__file__).parent / 'output' / 'vc-founders.json'
OUT_JSON = Path(__file__).parent / 'output' / 'vc-founders-enriched.json'
OUT_CSV  = Path(__file__).parent / 'output' / 'vc-founders-enriched.csv'

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
IGNORE_EMAIL_DOMAINS = {'sentry.io', 'example.com', 'placeholder.com',
                        'gmail.com', 'yahoo.com', 'hotmail.com', 'wix.com'}
IGNORE_EMAIL_PREFIXES = {'support', 'info', 'hello', 'contact', 'no-reply',
                         'noreply', 'team', 'help', 'admin', 'press', 'media',
                         'john.doe', 'abcdefghij', 'abcdef'}
IGNORE_EMAIL_SENDERS  = {'khoslaventures.com', 'sequoiacap.com', 'a16z.com',
                         'benchmark.com', 'greylock.com', 'accel.com',
                         'lead411.io'}   # VC / data-vendor addresses

# ── LinkedIn lookup ───────────────────────────────────────────────────────────

def find_linkedin(name: str, company: str) -> str | None:
    """
    Keyword search with exact quoted name. Validates the result actually
    contains the person's last name so we don't return wrong profiles.
    """
    last_name = name.strip().split()[-1].lower() if name.strip() else ''
    query = f'"{name}" "{company}"' if company else f'"{name}" founder'

    try:
        res = exa.search_and_contents(
            query,
            include_domains=['linkedin.com'],
            type='auto',
            num_results=3,
            text={'max_characters': 200},
        )
        for r in res.results:
            # Must be a real profile URL, not search/jobs/company pages
            if not re.search(r'linkedin\.com/in/[^/?]+$', r.url):
                continue
            # Title or text should contain the last name
            combined = ((r.title or '') + ' ' + (r.text or '')).lower()
            if last_name and last_name not in combined:
                continue
            return r.url
    except Exception as e:
        print(f'      linkedin error: {e}')
    return None

# ── Email lookup ──────────────────────────────────────────────────────────────

def extract_emails(text: str) -> list[str]:
    found = EMAIL_RE.findall(text or '')
    clean = []
    for e in found:
        local, domain = e.split('@', 1)
        if domain in IGNORE_EMAIL_DOMAINS:      continue
        if domain in IGNORE_EMAIL_SENDERS:      continue
        if local in IGNORE_EMAIL_PREFIXES:      continue
        if any(local.startswith(p) for p in IGNORE_EMAIL_PREFIXES): continue
        clean.append(e)
    return clean

def find_email(name: str, company: str, source_url: str) -> str | None:
    """
    Two attempts:
    1. Search the company's own domain for a team/contact page.
    2. Broad web search for the founder's name + email.
    """
    # Try to derive company domain from source_url
    company_domain = None
    if source_url:
        m = re.search(r'https?://(?:www\.)?([^/]+)', source_url)
        if m:
            company_domain = m.group(1)

    # Attempt 1: company website team/about/contact page
    if company_domain:
        try:
            res = exa.search_and_contents(
                f'{name} contact email team',
                include_domains=[company_domain],
                type='neural',
                num_results=3,
                text={'max_characters': 1000},
            )
            for r in res.results:
                emails = extract_emails(r.text)
                if emails:
                    return emails[0]
        except Exception:
            pass
        time.sleep(0.2)

    # Attempt 2: broad search for founder email
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}" email contact',
            type='auto',
            num_results=3,
            text={'max_characters': 800},
        )
        for r in res.results:
            emails = extract_emails(r.text)
            if emails:
                return emails[0]
    except Exception:
        pass

    return None

# ── main ─────────────────────────────────────────────────────────────────────

CSV_FIELDS = ['founder_name', 'company_name', 'european_country',
              'funding_info', 'linkedin_url', 'email', 'vc', 'source_url']

def main():
    founders = json.loads(IN_JSON.read_text())
    total = len(founders)
    print(f'Loaded {total} founders\n')

    for i, f in enumerate(founders):
        name    = (f.get('founder_name') or '').strip()
        company = (f.get('company_name') or '').strip()
        if not name:
            continue

        changed = False
        prefix  = f'[{i+1}/{total}] {name}'

        # ── LinkedIn ──────────────────────────────────────────────────────────
        if not f.get('linkedin_url'):
            print(f'{prefix} — searching LinkedIn…', end=' ', flush=True)
            url = find_linkedin(name, company)
            if url:
                f['linkedin_url'] = url
                print(f'✓ {url}')
                changed = True
            else:
                print('not found')
            time.sleep(0.3)
        else:
            print(f'{prefix} — LinkedIn already set')

        # ── Email ────────────────────────────────────────────────────────────
        if not f.get('email'):
            email = find_email(name, company, f.get('source_url', ''))
            if email:
                f['email'] = email
                print(f'  email: {email}')
                changed = True

        # Save after each founder so progress isn't lost
        if changed:
            OUT_JSON.write_text(json.dumps(founders, indent=2))

        time.sleep(0.25)

    # Final save + CSV
    OUT_JSON.write_text(json.dumps(founders, indent=2))

    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=CSV_FIELDS, extrasaction='ignore')
        w.writeheader()
        w.writerows(founders)

    with_li    = sum(1 for f in founders if f.get('linkedin_url'))
    with_email = sum(1 for f in founders if f.get('email'))
    print(f'\n{"─"*40}')
    print(f'LinkedIn found : {with_li}/{total}')
    print(f'Emails found   : {with_email}/{total}')
    print(f'Output: scripts/output/vc-founders-enriched.csv')

if __name__ == '__main__':
    main()
