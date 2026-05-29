#!/usr/bin/env python3
"""
vc_search.py
Find European founders in SF/Bay Area backed by tier-1/2 VCs.

Three search strategies per VC:
  1. Site search  — search the VC's own domain for portfolio/company pages
  2. News search  — web articles about this VC backing European founders in SF
  3. Announcement — funding announcements mentioning European background founders

Uses Exa for retrieval, Claude Haiku for extraction.
Saves output/vc-founders.json after every VC so partial runs are kept.
"""

import os, json, re, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa
import anthropic

load_dotenv(Path(__file__).parent.parent / '.env')

exa    = Exa(os.environ['EXA_API_KEY'])
claude = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

OUT_DIR = Path(__file__).parent / 'output'
OUT_DIR.mkdir(exist_ok=True)
OUT_JSON = OUT_DIR / 'vc-founders.json'
OUT_CSV  = OUT_DIR / 'vc-founders.csv'

# ── VC list ───────────────────────────────────────────────────────────────────
SOURCES = [
    {"name": "Y Combinator",       "domain": "ycombinator.com"},
    {"name": "Sequoia Capital",    "domain": "sequoiacap.com"},
    {"name": "Andreessen Horowitz","domain": "a16z.com"},
    {"name": "Founders Fund",      "domain": "foundersfund.com"},
    {"name": "Khosla Ventures",    "domain": "khoslaventures.com"},
    {"name": "Benchmark",          "domain": "benchmark.com"},
    {"name": "Lightspeed",         "domain": "lsvp.com"},
    {"name": "General Catalyst",   "domain": "generalcatalyst.com"},
    {"name": "NEA",                "domain": "nea.com"},
    {"name": "Greylock",           "domain": "greylock.com"},
    {"name": "Kleiner Perkins",    "domain": "kleinerperkins.com"},
    {"name": "Accel",              "domain": "accel.com"},
    {"name": "Bessemer",           "domain": "bvp.com"},
    {"name": "Index Ventures",     "domain": "indexventures.com"},
    {"name": "First Round Capital","domain": "firstround.com"},
    {"name": "CRV",                "domain": "crv.com"},
    {"name": "Redpoint Ventures",  "domain": "redpoint.com"},
    {"name": "Lux Capital",        "domain": "luxcapital.com"},
    {"name": "Coatue",             "domain": "coatue.com"},
]

# ── Search strategy per VC ────────────────────────────────────────────────────
def build_searches(vc: dict) -> list[dict]:
    name   = vc['name']
    domain = vc['domain']
    return [
        # 1. VC's own site — portfolio/companies pages
        dict(query='portfolio companies founders',
             include_domains=[domain],
             type='neural', num_results=8, max_chars=4000),
        dict(query='European founder San Francisco announcement investment',
             include_domains=[domain],
             type='neural', num_results=5, max_chars=4000),

        # 2. News/articles about this VC + European founders in SF
        dict(query=f'{name} portfolio European founder San Francisco raised',
             type='neural', num_results=5, max_chars=4000,
             start_date='2019-01-01'),
        dict(query=f'{name} backed European startup founder Bay Area Silicon Valley',
             type='neural', num_results=5, max_chars=4000,
             start_date='2019-01-01'),

        # 3. Funding announcements with European background signal
        dict(query=f'{name} investment announcement European born founder San Francisco',
             type='neural', num_results=5, max_chars=4000,
             start_date='2019-01-01'),
        dict(query=f'{name} Series A B European founder Silicon Valley startup funding',
             type='neural', num_results=5, max_chars=4000,
             start_date='2020-01-01'),
    ]

# ── Claude extraction ─────────────────────────────────────────────────────────
EXTRACT_PROMPT = """\
Extract founders from this VC portfolio or news page.

VC: {vc_name}
Source: {url}

Text:
{text}

Return a JSON array of founders who are BOTH:
1. European by origin/background (any EU country, UK, Scandinavia, Eastern Europe)
2. Currently based in San Francisco / Bay Area / Silicon Valley

Each item:
{{
  "founder_name": "",
  "company_name": "",
  "european_country": "",
  "funding_info": "",
  "linkedin_url": ""
}}

Only include fields that are actually present.
Exclude founders based in Europe (not SF), historical figures, or investors.
If none qualify, return [].
Return ONLY valid JSON, nothing else."""

def extract_founders(text: str, url: str, vc_name: str) -> list[dict]:
    if not text or len(text) < 80:
        return []
    try:
        resp = claude.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1024,
            messages=[{'role': 'user', 'content': EXTRACT_PROMPT.format(
                vc_name=vc_name, url=url, text=text[:5000]
            )}]
        )
        raw = resp.content[0].text.strip()
        m = re.search(r'\[[\s\S]*\]', raw)
        if m:
            return json.loads(m.group())
    except Exception:
        pass
    return []

# ── Per-VC search ─────────────────────────────────────────────────────────────
def search_vc(vc: dict, global_seen: set) -> list[dict]:
    found   = []
    local_seen = set()
    searches = build_searches(vc)

    for s in searches:
        kwargs = dict(
            num_results = s['num_results'],
            type        = s['type'],
            text        = {'max_characters': s['max_chars']},
        )
        if 'include_domains' in s:
            kwargs['include_domains'] = s['include_domains']
        if 'start_date' in s:
            kwargs['start_published_date'] = s['start_date']

        try:
            res = exa.search_and_contents(s['query'], **kwargs)
            for r in res.results:
                if not r.text:
                    continue
                for f in extract_founders(r.text, r.url, vc['name']):
                    key = (f.get('founder_name') or '').lower().strip()
                    if not key or key in local_seen or key in global_seen:
                        continue
                    local_seen.add(key)
                    f['vc']         = vc['name']
                    f['source_url'] = r.url
                    found.append(f)
        except Exception as e:
            print(f'      search error: {e}')

        time.sleep(0.3)

    return found

# ── CSV writer ────────────────────────────────────────────────────────────────
CSV_FIELDS = ['founder_name', 'company_name', 'european_country',
              'funding_info', 'linkedin_url', 'vc', 'source_url']

def write_csv(rows: list[dict]):
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

# ── main ──────────────────────────────────────────────────────────────────────
def main():
    all_founders: list[dict] = []
    global_seen:  set[str]   = set()

    for i, vc in enumerate(SOURCES):
        print(f'\n[{i+1}/{len(SOURCES)}] {vc["name"]}')
        found = search_vc(vc, global_seen)

        # Add to global set and results
        for f in found:
            key = (f.get('founder_name') or '').lower().strip()
            if key:
                global_seen.add(key)
        all_founders.extend(found)

        print(f'  → {len(found)} new founders  (running total: {len(all_founders)})')

        # Save after every VC so nothing is lost
        OUT_JSON.write_text(json.dumps(all_founders, indent=2))
        write_csv(all_founders)

        time.sleep(0.5)

    # Final summary
    print(f'\n{"─"*40}')
    print(f'Total unique founders : {len(all_founders)}')
    with_linkedin = sum(1 for f in all_founders if f.get('linkedin_url'))
    print(f'With LinkedIn URL     : {with_linkedin}')
    by_vc = {}
    for f in all_founders:
        by_vc[f['vc']] = by_vc.get(f['vc'], 0) + 1
    print('\nBy VC:')
    for vc, count in sorted(by_vc.items(), key=lambda x: -x[1]):
        print(f'  {vc:<25} {count}')
    print(f'\nOutput: scripts/output/vc-founders.csv')

if __name__ == '__main__':
    main()
