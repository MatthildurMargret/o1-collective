#!/usr/bin/env python3
"""
find_linkedin_deeper.py
Tries four different Exa search strategies to find LinkedIn profiles for
anyone in the invite list CSV who is missing one.

Strategies (run in order, stops at first confident hit):
  1. Name + Company within linkedin.com
  2. Name + Company + "linkedin" on the open web, extract URLs from text
  3. Name + "linkedin.com/in/" keyword search
  4. Name only within linkedin.com (looser, validated against company)

Writes results to a new CSV alongside the original file.
"""

import os, re, time, csv, unicodedata
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa

load_dotenv(Path(__file__).parent.parent / '.env')
exa = Exa(os.environ['EXA_API_KEY'])

IN_CSV  = Path('/Users/matthildur/Downloads/Midsommar Invite List - first draft - Final list.csv')
OUT_CSV = IN_CSV.parent / 'Midsommar Invite List - enriched.csv'

LINKEDIN_RE = re.compile(r'(?:https?://)?(?:\w+\.)?linkedin\.com/in/([A-Za-z0-9\-_%]+)')

SKIP_NAMES = {'founders of stripe', 'founders of'}  # non-person rows


def normalize(s: str) -> str:
    """Lowercase, strip accents for fuzzy name matching."""
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()


def clean_url(raw: str) -> str:
    """Normalize to linkedin.com/in/slug (no scheme, no trailing slash)."""
    m = LINKEDIN_RE.search(raw)
    if m:
        return f'linkedin.com/in/{m.group(1).rstrip("/")}'
    return ''


def is_profile_url(url: str) -> bool:
    """Must be a personal profile URL, not a company/post/search page."""
    return bool(re.search(r'linkedin\.com/in/[A-Za-z0-9\-_%]+$', url))


def name_in_text(name: str, text: str) -> bool:
    """Check that at least the last name appears in the text."""
    parts = normalize(name).split()
    last  = parts[-1] if parts else ''
    return last and last in normalize(text)


def extract_urls_from_text(text: str) -> list[str]:
    return [clean_url(m.group()) for m in LINKEDIN_RE.finditer(text or '') if m]


def strategy_1(name: str, company: str) -> str:
    """Search within linkedin.com for Name + Company."""
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}"',
            include_domains=['linkedin.com'],
            type='auto',
            num_results=5,
            text={'max_characters': 400},
        )
        for r in res.results:
            if is_profile_url(r.url) and name_in_text(name, (r.title or '') + (r.text or '')):
                return clean_url(r.url)
            # Also check text for embedded URLs
            for url in extract_urls_from_text(r.text or ''):
                if is_profile_url(url) and name_in_text(name, r.text or ''):
                    return url
    except Exception as e:
        print(f'    s1 err: {e}', end='')
    return ''


def strategy_2(name: str, company: str) -> str:
    """Open-web search for Name + Company + linkedin, extract URLs from page text."""
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}" linkedin',
            type='auto',
            num_results=6,
            text={'max_characters': 600},
        )
        for r in res.results:
            # Direct profile URL in the result itself
            if is_profile_url(r.url) and name_in_text(name, (r.title or '') + (r.text or '')):
                return clean_url(r.url)
            # LinkedIn URL embedded in page text
            for url in extract_urls_from_text((r.title or '') + ' ' + (r.text or '')):
                if is_profile_url(url):
                    return url
    except Exception as e:
        print(f'    s2 err: {e}', end='')
    return ''


def strategy_3(name: str, company: str) -> str:
    """Keyword search for Name + linkedin.com/in/ anywhere on the web."""
    try:
        res = exa.search_and_contents(
            f'"{name}" linkedin.com/in/',
            type='auto',
            num_results=5,
            text={'max_characters': 400},
        )
        for r in res.results:
            if is_profile_url(r.url) and name_in_text(name, (r.title or '') + (r.text or '')):
                return clean_url(r.url)
            for url in extract_urls_from_text((r.text or '')):
                if is_profile_url(url) and name_in_text(name, r.text or ''):
                    return url
    except Exception as e:
        print(f'    s3 err: {e}', end='')
    return ''


def strategy_4(name: str, company: str) -> str:
    """Name-only search on LinkedIn — validated against company name in text."""
    try:
        res = exa.search_and_contents(
            f'"{name}"',
            include_domains=['linkedin.com'],
            type='neural',
            num_results=5,
            text={'max_characters': 600},
        )
        company_norm = normalize(company)
        for r in res.results:
            combined = normalize((r.title or '') + ' ' + (r.text or ''))
            if (is_profile_url(r.url)
                    and name_in_text(name, combined)
                    and company_norm in combined):
                return clean_url(r.url)
    except Exception as e:
        print(f'    s4 err: {e}', end='')
    return ''


STRATEGIES = [strategy_1, strategy_2, strategy_3, strategy_4]
STRATEGY_NAMES = ['linkedin+company', 'open-web', 'keyword', 'name-only']


def find_linkedin(name: str, company: str) -> tuple[str, str]:
    """
    Run strategies in order. Returns (url, strategy_name) or ('', '').
    """
    for fn, label in zip(STRATEGIES, STRATEGY_NAMES):
        url = fn(name, company)
        if url:
            return url, label
        time.sleep(0.25)
    return '', ''


def main():
    with open(IN_CSV, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    fieldnames = list(rows[0].keys()) if rows else []

    missing = [r for r in rows if not r.get('LinkedIn Profile', '').strip()]
    skipped = [r for r in missing if normalize(r.get('Name', '')) in SKIP_NAMES
               or 'founders of' in normalize(r.get('Name', ''))]
    to_check = [r for r in missing if r not in skipped]

    print(f'Total rows       : {len(rows)}')
    print(f'Already have URL : {len(rows) - len(missing)}')
    print(f'Missing          : {len(missing)}  ({len(skipped)} skipped as non-person)')
    print(f'Will search      : {len(to_check)}\n')

    found_count = 0

    for i, row in enumerate(to_check):
        name    = row.get('Name', '').strip()
        company = row.get('Company Name', '').strip()

        print(f'[{i+1}/{len(to_check)}] {name} @ {company}', end=' ... ')

        url, strategy = find_linkedin(name, company)

        if url:
            row['LinkedIn Profile'] = url
            found_count += 1
            print(f'✓  {url}  [{strategy}]')
        else:
            print('—')

        time.sleep(0.2)

    # Write enriched CSV
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

    still_missing = sum(1 for r in rows if not r.get('LinkedIn Profile', '').strip())
    print(f'\n{"─"*50}')
    print(f'New profiles found : {found_count} / {len(to_check)}')
    print(f'Still missing      : {still_missing}')
    print(f'Output             : {OUT_CSV}')


if __name__ == '__main__':
    main()
