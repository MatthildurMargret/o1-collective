#!/usr/bin/env python3
"""
query_sf_companies.py
Pull all SF/Bay Area tech companies (Seed → Series D) from Supabase.
Saves to output/sf-companies.json.
"""

import os, json, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')

URL = os.environ['SUPABASE_URL']
KEY = os.environ['SUPABASE_ANON_KEY']
H   = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Accept': 'application/json',
    'Prefer': 'count=exact',
}

SF_LOCALITIES = [
    'San Francisco', 'Palo Alto', 'Menlo Park', 'Mountain View', 'San Jose',
    'Sunnyvale', 'Santa Clara', 'Redwood City', 'Oakland', 'Berkeley',
    'South San Francisco', 'San Mateo', 'Foster City', 'Burlingame',
]

STAGES = [
    'Seed', 'Series A', 'Series B', 'Series C', 'Series D',
    'Early Stage VC', 'Venture Round', 'Later Stage VC',
]

COLUMNS = ','.join([
    'id', 'name', 'description', 'website', 'locality', 'region', 'country',
    'latest_deal_type', 'latest_deal_amount', 'total_funding',
    'funding_round_count', 'industry_list', 'headcount', 'status',
    'linkedin_url', 'crunchbase_url',
])

PAGE = 500

def fetch_all() -> list[dict]:
    locality_filter = f'in.({",".join(SF_LOCALITIES)})'
    stage_filter    = f'in.({",".join(STAGES)})'
    params_base = {
        'select':            COLUMNS,
        'locality':          locality_filter,
        'latest_deal_type':  stage_filter,
        'total_funding':     'gt.0',
        'website':           'not.is.null',
        'order':             'total_funding.desc',
    }

    # Get total
    r = requests.get(f'{URL}/rest/v1/companies', headers=H,
                     params={**params_base, 'limit': 1})
    total = int(r.headers.get('content-range', '0/0').split('/')[-1])
    pages = -(-total // PAGE)   # ceiling division
    print(f'Total companies to fetch: {total} ({pages} pages)')

    all_rows = []
    for page in range(pages):
        r = requests.get(f'{URL}/rest/v1/companies', headers=H,
                         params={**params_base, 'limit': PAGE, 'offset': page * PAGE})
        r.raise_for_status()
        all_rows.extend(r.json())
        print(f'  fetched {len(all_rows)}/{total}', end='\r')

    print()
    return all_rows

def main():
    out = Path(__file__).parent / 'output'
    out.mkdir(exist_ok=True)

    companies = fetch_all()

    # Quick summary
    by_stage = {}
    for c in companies:
        s = c.get('latest_deal_type', 'unknown')
        by_stage[s] = by_stage.get(s, 0) + 1

    print(f'\nFetched {len(companies)} companies')
    print('By stage:')
    for s, n in sorted(by_stage.items(), key=lambda x: -x[1]):
        print(f'  {s:<20} {n}')

    (out / 'sf-companies.json').write_text(json.dumps(companies, indent=2))
    print(f'\nSaved → output/sf-companies.json')

if __name__ == '__main__':
    main()
