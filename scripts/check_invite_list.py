#!/usr/bin/env python3
"""
check_invite_list.py
Quality-checks every person in the Midsommar invite list against four criteria:
  1. SF-based         — physically in the Bay Area
  2. European         — European name / background / origin
  3. Role             — founder or key builder/operator at a startup
  4. Company quality  — funded, interesting, growing

For each person:
  - Fetches LinkedIn profile text via Exa (if URL available)
  - Searches the web for name + company context (company funding, press, etc.)
  - Sends combined text to Gemini flash for classification

Output fields added:
  sf_based, european, role, company_quality, invite_flag, notes

invite_flag:
  green  — meets all criteria, clear invite
  yellow — uncertain on ≥1 criterion, worth a manual look
  red    — clearly fails a key criterion (not SF, not European, wrong role)

Saves incrementally — safe to interrupt and re-run.
"""

import os, json, re, time, csv
from pathlib import Path
from dotenv import load_dotenv
from exa_py import Exa
from google import genai
from google.genai import types

load_dotenv(Path(__file__).parent.parent / '.env')

exa    = Exa(os.environ['EXA_API_KEY'])
gemini = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

IN_CSV  = Path('/Users/matthildur/Downloads/Midsommar Invite List - enriched.csv')
OUT_CSV = IN_CSV.parent / 'Midsommar Invite List - checked.csv'

NEW_FIELDS = ['sf_based', 'european', 'role', 'company_quality', 'invite_flag', 'notes']

CLASSIFY_PROMPT = """\
You are evaluating whether someone should be invited to a curated SF event for \
European tech founders and operators building interesting companies.

Four criteria to assess:
1. SF-based: Are they physically in the San Francisco Bay Area right now?
2. European: Do they have European roots — name origin, education, nationality, or background?
3. Role: Are they a founder, co-founder, or a key hands-on builder/operator (engineer, PM, \
   design, data) at a startup — NOT a passive investor, big-corp middle manager, or irrelevant role?
4. Company quality: Is their company notable — venture-backed (seed/Series A+), \
   fast-growing, working on interesting tech, or otherwise impressive?

Person details:
  Name    : {name}
  Title   : {title}
  Company : {company}

Info gathered from LinkedIn / web:
{text}

Respond with JSON only:
{{
  "sf_based": "sf_yes | sf_no | unknown",
  "european": "yes | no | unknown",
  "role": "founder | operator | other",
  "company_quality": "strong | ok | unclear",
  "invite_flag": "green | yellow | red",
  "notes": "<one short sentence summarising location, background, role and company>"
}}

invite_flag logic:
  green  — SF-based (or very likely), European, founder or operator, company looks solid
  red    — clearly not SF, clearly not European, or role is irrelevant
  yellow — anything in between (one criterion uncertain, or company hard to evaluate)

Notes example: "SF-based French co-founder of Series B AI startup" or \
"London-based engineer, not SF" or "European name, unclear if in SF, early-stage."

Return ONLY valid JSON, nothing else."""


def fetch_linkedin(url: str) -> str:
    try:
        res = exa.get_contents([f'https://{url}' if not url.startswith('http') else url],
                               text={'max_characters': 1200})
        if res.results and res.results[0].text:
            return res.results[0].text
    except Exception as e:
        print(f' [li-err:{e}]', end='')
    return ''


def search_context(name: str, company: str) -> str:
    """Web search for name + company — surfaces funding, press, company description."""
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}"',
            type='auto',
            num_results=4,
            text={'max_characters': 500},
        )
        return '\n'.join(
            (r.title or '') + ' ' + (r.text or '')
            for r in res.results if r.text
        )
    except Exception as e:
        print(f' [web-err:{e}]', end='')
    return ''


def classify(name: str, title: str, company: str, text: str) -> dict:
    if not text.strip():
        return {
            'sf_based': 'unknown', 'european': 'unknown',
            'role': 'unclear', 'company_quality': 'unclear',
            'invite_flag': 'yellow', 'notes': 'No info found.',
        }
    try:
        resp = gemini.models.generate_content(
            model='gemini-2.0-flash',
            contents=CLASSIFY_PROMPT.format(
                name=name, title=title, company=company, text=text[:4000]
            ),
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                max_output_tokens=300,
                temperature=0,
            ),
        )
        m = re.search(r'\{[\s\S]*\}', resp.text.strip())
        if m:
            return json.loads(m.group())
    except Exception as e:
        print(f' [gemini-err:{e}]', end='')
    return {
        'sf_based': 'unknown', 'european': 'unknown',
        'role': 'unclear', 'company_quality': 'unclear',
        'invite_flag': 'yellow', 'notes': 'Classification failed.',
    }


SKIP_NAMES = {'founders of stripe'}


def main():
    with open(IN_CSV, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    fieldnames = list(rows[0].keys()) + [f for f in NEW_FIELDS if f not in rows[0]]

    already_done = sum(1 for r in rows if r.get('invite_flag'))
    to_do = [r for r in rows if not r.get('invite_flag')]
    print(f'Total: {len(rows)}  |  Already checked: {already_done}  |  To check: {len(to_do)}\n')

    counter = 0
    for i, row in enumerate(rows):
        if row.get('invite_flag'):
            continue

        name    = row.get('Name', '').strip()
        title   = row.get('title', '').strip()
        company = row.get('Company Name', '').strip()
        li_url  = row.get('LinkedIn Profile', '').strip()

        if name.lower() in SKIP_NAMES:
            for f in NEW_FIELDS:
                row[f] = 'n/a'
            row['invite_flag'] = 'red'
            row['notes'] = 'Skipped — not a real person entry.'
            continue

        counter += 1
        print(f'[{counter}/{len(to_do)}] {name} @ {company}...', end=' ', flush=True)

        # Gather info: LinkedIn profile + web context
        li_text  = fetch_linkedin(li_url) if li_url else ''
        web_text = search_context(name, company)
        combined = '\n\n'.join(filter(None, [li_text, web_text]))

        result = classify(name, title, company, combined)

        for f in NEW_FIELDS:
            row[f] = result.get(f, '')

        flag = row['invite_flag']
        print(f'{flag.upper()}  — {row["notes"]}')

        # Incremental save every 10
        if counter % 10 == 0:
            with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f_out:
                w = csv.DictWriter(f_out, fieldnames=fieldnames, extrasaction='ignore')
                w.writeheader()
                w.writerows(rows)

        time.sleep(0.3)

    # Final save
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f_out:
        w = csv.DictWriter(f_out, fieldnames=fieldnames, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

    green  = sum(1 for r in rows if r.get('invite_flag') == 'green')
    yellow = sum(1 for r in rows if r.get('invite_flag') == 'yellow')
    red    = sum(1 for r in rows if r.get('invite_flag') == 'red')

    print(f'\n{"─"*50}')
    print(f'Green  (invite)  : {green}')
    print(f'Yellow (review)  : {yellow}')
    print(f'Red    (exclude) : {red}')
    print(f'\nOutput: {OUT_CSV}')


if __name__ == '__main__':
    main()
