"""
sf_verify.py
Shared SF Bay Area location verification — used by find_operators.py and
verify_sf_location.py.

Usage:
    from sf_verify import verify_sf
    result = verify_sf(name, company, linkedin_url, exa=exa, gemini=gemini)
    # result: {location_raw, sf_verified, location_source}
    # sf_verified: 'sf_yes' | 'sf_no' | 'unknown'
"""

import json, re, time

CLASSIFY_PROMPT = """\
You are verifying whether a person is physically based in the San Francisco Bay Area.

Person: {name}
Company (SF-headquartered): {company}
Text scraped from the web about this person:
{text}

Based solely on location signals in the text, determine:
- Are they currently based in the SF Bay Area?
- What is their raw location string if explicitly mentioned?

Respond with JSON only:
{{
  "location_raw": "<exact location string from the text, or empty string if none found>",
  "sf_verified": "<sf_yes | sf_no | unknown>"
}}

Rules:
- sf_yes: location clearly indicates SF Bay Area (San Francisco, Bay Area, Silicon Valley,
  Palo Alto, San Jose, Oakland, Berkeley, Menlo Park, Mountain View, etc.)
- sf_no: location clearly indicates somewhere else (London, Berlin, Paris, New York,
  remote, Austin, Seattle, etc.)
- unknown: no location signal found, or too ambiguous to call

Return ONLY valid JSON, nothing else."""


def _fetch_linkedin(exa, linkedin_url: str) -> str:
    try:
        result = exa.get_contents([linkedin_url], text={'max_characters': 1200})
        if result.results and result.results[0].text:
            return result.results[0].text
    except Exception as e:
        print(f' [exa-get: {e}]', end='')
    return ''


def _search_web(exa, name: str, company: str) -> str:
    try:
        res = exa.search_and_contents(
            f'"{name}" "{company}"',
            type='auto',
            num_results=5,
            text={'max_characters': 600},
        )
        return '\n'.join(
            (r.title or '') + ' ' + (r.text or '')
            for r in res.results if r.text
        )
    except Exception as e:
        print(f' [exa-search: {e}]', end='')
    return ''


def _classify(gemini, name: str, company: str, text: str) -> dict:
    if not text.strip():
        return {'location_raw': '', 'sf_verified': 'unknown'}
    try:
        from google.genai import types
        resp = gemini.models.generate_content(
            model='gemini-2.0-flash',
            contents=CLASSIFY_PROMPT.format(name=name, company=company, text=text[:3000]),
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                max_output_tokens=256,
                temperature=0,
            ),
        )
        m = re.search(r'\{[\s\S]*\}', resp.text.strip())
        if m:
            return json.loads(m.group())
    except Exception as e:
        print(f' [gemini: {e}]', end='')
    return {'location_raw': '', 'sf_verified': 'unknown'}


def verify_sf(name: str, company: str, linkedin_url: str, *, exa, gemini) -> dict:
    """
    Returns {location_raw, sf_verified, location_source}.
    Tries LinkedIn profile first; falls back to broad web search.
    """
    text, source = '', 'none'

    if linkedin_url:
        text = _fetch_linkedin(exa, linkedin_url)
        if text:
            source = 'linkedin'
        else:
            time.sleep(0.2)

    if not text:
        text = _search_web(exa, name, company)
        source = 'web' if text else 'none'

    result = _classify(gemini, name, company, text)
    result['location_source'] = source
    return result
