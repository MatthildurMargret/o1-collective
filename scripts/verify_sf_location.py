#!/usr/bin/env python3
"""
verify_sf_location.py
Batch-verify the SF location of every operator in european-operators.json.

  - sf_yes / unknown  → kept in both JSON and CSV
  - sf_no             → kept in JSON (so we don't re-check them), excluded from CSV

Saves incrementally — safe to interrupt and re-run.
"""

import os, json, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa
from google import genai
from sf_verify import verify_sf

load_dotenv(Path(__file__).parent.parent / '.env')

exa    = Exa(os.environ['EXA_API_KEY'])
gemini = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

IN_JSON  = Path(__file__).parent / 'output' / 'european-operators.json'
OUT_JSON = Path(__file__).parent / 'output' / 'european-operators.json'
OUT_CSV  = Path(__file__).parent / 'output' / 'european-operators.csv'

CSV_FIELDS = [
    'name', 'title', 'company', 'company_stage', 'total_funding',
    'european_background', 'linkedin_url', 'team_page_url',
    'location_raw', 'sf_verified', 'location_source',
]


def write_csv(ops: list[dict]):
    rows = [op for op in ops if op.get('sf_verified') != 'sf_no']
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)


def main():
    data  = json.loads(IN_JSON.read_text())
    ops   = data['results']
    total = len(ops)

    already_done = sum(1 for op in ops if op.get('sf_verified'))
    print(f'Loaded {total} operators ({already_done} already verified)\n')

    for i, op in enumerate(ops):
        if op.get('sf_verified'):
            continue

        name         = (op.get('name') or '').strip()
        company      = (op.get('company') or '').strip()
        linkedin_url = op.get('linkedin_url', '')

        print(f'[{i+1}/{total}] {name} @ {company}...', end=' ', flush=True)

        result = verify_sf(name, company, linkedin_url, exa=exa, gemini=gemini)
        op.update(result)

        loc = op['location_raw'] or 'no location found'
        print(f'{op["sf_verified"]}  ({loc})')

        if (i + 1) % 10 == 0:
            data['results'] = ops
            OUT_JSON.write_text(json.dumps(data, indent=2))
            write_csv(ops)

        time.sleep(0.3)

    data['results'] = ops
    OUT_JSON.write_text(json.dumps(data, indent=2))
    write_csv(ops)

    sf_yes = sum(1 for op in ops if op.get('sf_verified') == 'sf_yes')
    sf_no  = sum(1 for op in ops if op.get('sf_verified') == 'sf_no')
    unk    = sum(1 for op in ops if op.get('sf_verified') == 'unknown')

    print(f'\n{"─"*45}')
    print(f'SF-based     : {sf_yes}  (in CSV)')
    print(f'Unknown      : {unk}  (in CSV)')
    print(f'Not SF-based : {sf_no}  (JSON only, excluded from CSV)')
    print(f'\nOutput: scripts/output/european-operators.csv')


if __name__ == '__main__':
    main()
