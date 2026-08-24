"""
Poster frames for the catalogue, fetched once and served from this site.

    python3 tools/posters.py

Reads the ids and links out of `src/content/work.ts` and writes one WebP per
work into `public/films/`. The point is the site's standing rule: **nothing is
requested from YouTube, Spotify or Instagram until a reader presses play.** A
grid of seventeen hotlinked thumbnails would tell Google who visited the page
before anyone had asked for anything, so the frames live here instead.

Three sources, because the three platforms give three different things:

- YouTube has a real frame. `maxresdefault` where the upload was HD, falling
  back to `hqdefault`, which always exists.
- Spotify has cover art, and it is square. A square cropped to 16:9 loses the
  top and bottom of the sleeve, which is where the title usually is — so the art
  is *contained* over a blurred, darkened copy of itself. One aspect ratio across
  the whole grid without cutting anyone's artwork.
- Instagram gives nothing without scraping it, so those get no poster and the
  page sets them typographically instead. That is deliberate, not a gap.

Rerun after adding to `catalogue`. Existing files are left alone unless --force.
"""

import io
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "films")
SOURCE = os.path.join(ROOT, "src", "content", "work.ts")
WIDE = (640, 360)
FORCE = "--force" in sys.argv

UA = {"User-Agent": "Mozilla/5.0 (blesspoke poster fetch)"}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read()


def works() -> list[dict[str, str]]:
    """The catalogue, read off the one place it is written down."""
    text = open(SOURCE, encoding="utf-8").read()
    block = text[text.index("export const catalogue"):]
    block = block[: block.index("\n];")]
    found = []
    for entry in re.findall(r"\{(.*?)\}", block, re.S):
        fields = dict(re.findall(r'(\w+):\s*"([^"]*)"', entry))
        if "id" in fields and "href" in fields:
            found.append(fields)
    return found


def youtube_frame(video: str) -> bytes:
    for name in ("maxresdefault", "hqdefault"):
        try:
            return fetch(f"https://i.ytimg.com/vi/{video}/{name}.jpg")
        except Exception:
            continue
    raise RuntimeError(f"no thumbnail for {video}")


def spotify_art(url: str) -> bytes:
    meta = json.loads(fetch(f"https://open.spotify.com/oembed?url={url}").decode())
    return fetch(meta["thumbnail_url"])


def main() -> None:
    from PIL import Image, ImageEnhance, ImageFilter

    os.makedirs(OUT, exist_ok=True)
    for work in works():
        on, ident = work.get("on", ""), work["id"]
        path = os.path.join(OUT, f"{ident}.webp")
        if on == "Instagram":
            print(f"{ident:24s} no poster — set typographically")
            continue
        if os.path.exists(path) and not FORCE:
            print(f"{ident:24s} kept")
            continue

        try:
            if on == "YouTube":
                video = re.search(r"youtu\.be/([\w-]+)", work["href"]).group(1)
                raw = youtube_frame(video)
                art = Image.open(io.BytesIO(raw)).convert("RGB")
                # hqdefault is letterboxed 4:3; take the 16:9 centre out of it.
                if abs(art.width / art.height - 4 / 3) < 0.02:
                    band = round(art.width * 9 / 16)
                    top = (art.height - band) // 2
                    art = art.crop((0, top, art.width, top + band))
                frame = art.resize(WIDE, Image.LANCZOS)
            else:
                art = Image.open(io.BytesIO(spotify_art(work["href"]))).convert("RGB")
                ground = art.resize(WIDE, Image.LANCZOS).filter(ImageFilter.GaussianBlur(24))
                ground = ImageEnhance.Brightness(ground).enhance(0.45)
                side = WIDE[1]
                sleeve = art.resize((side, side), Image.LANCZOS)
                ground.paste(sleeve, ((WIDE[0] - side) // 2, 0))
                frame = ground
        except Exception as problem:  # noqa: BLE001 — report and carry on
            print(f"{ident:24s} FAILED: {problem}")
            continue

        frame.save(path, "WEBP", quality=82, method=6)
        print(f"{ident:24s} {round(os.path.getsize(path) / 1024)} KB")


if __name__ == "__main__":
    main()
