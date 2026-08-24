"""
Countries and their dialling codes, for the brief.

    python3 tools/countries.py

Writes `src/content/countries.ts`: every dialling region, its name, its ISO
two-letter code and its country calling code.

The source is Google's libphonenumber metadata by way of `phonenumbers`, with
names from `pycountry`. That choice is the whole point of the file. A dialling
code typed out by hand is a bug nobody notices until someone in Sri Lanka cannot
reach him, and the list of countries is not the list of dialling regions —
Puerto Rico and the United States share +1, Kosovo has +383 and no ISO 3166
entry — so both halves come from somewhere that already knows.

Build-time only. Nothing in the shipped site depends on either package.

    python3 -m pip install phonenumbers pycountry

Rerun after upgrading `phonenumbers`; codes change, rarely but they change.
"""

import os

import phonenumbers
import pycountry

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "content", "countries.ts")

# Where the work actually comes from. They sit at the top of the list, above a
# rule, because a Malaysian client should not scroll past Afghanistan to find
# Malaysia — and everyone else is one keystroke away in a native select anyway.
NEAR = ["MY", "SG", "ID", "BN", "TH", "VN", "PH", "HK", "TW", "CN", "AU", "GB", "US", "AE"]

# Names libphonenumber knows as regions and ISO 3166 does not, or knows by a
# longer name than anyone would look for.
OVERRIDE = {
    "XK": "Kosovo",
    "GB": "United Kingdom",
    "US": "United States",
    "AE": "United Arab Emirates",
    "KR": "South Korea",
    "KP": "North Korea",
    "TW": "Taiwan",
    "HK": "Hong Kong",
    "MO": "Macau",
    "VN": "Vietnam",
    "LA": "Laos",
    "RU": "Russia",
    "BO": "Bolivia",
    "VE": "Venezuela",
    "IR": "Iran",
    "SY": "Syria",
    "TZ": "Tanzania",
    "MD": "Moldova",
    "CD": "DR Congo",
    "CG": "Congo",
    "CI": "Côte d\'Ivoire",
    "CV": "Cape Verde",
    "SZ": "Eswatini",
    "PS": "Palestine",
    "BN": "Brunei",
}


def name_of(region: str) -> str | None:
    if region in OVERRIDE:
        return OVERRIDE[region]
    found = pycountry.countries.get(alpha_2=region)
    if not found:
        return None
    # "Bolivia, Plurinational State of" is not what anyone scans a list for.
    return getattr(found, "common_name", None) or found.name.split(",")[0]


def main() -> None:
    rows = []
    for region in sorted(phonenumbers.SUPPORTED_REGIONS):
        name = name_of(region)
        if not name:
            print(f"  skipped {region}: no name")
            continue
        rows.append((name, region, phonenumbers.country_code_for_region(region)))

    order = {region: index for index, region in enumerate(NEAR)}
    rows.sort(key=lambda row: (order.get(row[1], len(NEAR)), row[0]))

    lines = [
        f'  {{ name: "{name}", iso: "{iso}", dial: "+{dial}" }},'
        for name, iso, dial in rows
    ]

    with open(OUT, "w", encoding="utf-8") as out:
        out.write(
            f'''/**
 * Every dialling region, its name and its country calling code.
 *
 * GENERATED — do not hand-edit. `python3 tools/countries.py`, and read the note
 * at the top of that file for why this is generated rather than typed: the codes
 * come from Google\'s libphonenumber and the names from ISO 3166, because a
 * dialling code written out by hand is a bug nobody notices until someone
 * cannot reach him.
 *
 * The first {len(NEAR)} are where the work comes from and are listed first, so a
 * client in Kuala Lumpur does not scroll past Afghanistan to find Malaysia.
 */

export interface Country {{
  readonly name: string;
  /** ISO 3166-1 alpha-2, or libphonenumber\'s region where ISO has none. */
  readonly iso: string;
  readonly dial: string;
}}

/** How many entries at the top are the near ones, for the rule under them. */
export const NEAR_COUNT = {len(NEAR)};

export const countries: readonly Country[] = [
'''
        )
        out.write("\n".join(lines))
        out.write("\n];\n")

    print(f"{OUT}: {len(rows)} regions, {len(NEAR)} listed first")


if __name__ == "__main__":
    main()
