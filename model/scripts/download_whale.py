from pathlib import Path
from io import BytesIO
import requests
from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parent.parent
TARGET_DIR = PROJECT_ROOT / "dataset_raw" / "animals" / "animals" / "whale"
TARGET_COUNT = 60
TAXON_ID = 41566  # Megaptera novaeangliae (humpback whale)
PER_PAGE = 200
MAX_PAGES = 12


def is_valid_image(data: bytes) -> bool:
    try:
        with Image.open(BytesIO(data)) as img:
            img.verify()
        return True
    except Exception:
        return False


def collect_urls() -> list[str]:
    urls: list[str] = []
    for page in range(1, MAX_PAGES + 1):
        params = {
            "taxon_id": TAXON_ID,
            "quality_grade": "research",
            "photos": "true",
            "identified": "true",
            "verifiable": "true",
            "license": "cc0,cc-by,cc-by-nc,cc-by-sa,cc-by-nd",
            "order_by": "votes",
            "order": "desc",
            "per_page": PER_PAGE,
            "page": page,
        }
        r = requests.get("https://api.inaturalist.org/v1/observations", params=params, timeout=30)
        r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            break
        for obs in results:
            for photo in obs.get("photos", []):
                u = photo.get("url")
                if u:
                    urls.append(u.replace("square", "large"))
        if len(urls) >= TARGET_COUNT * 4:
            break
    return urls


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    for p in TARGET_DIR.iterdir():
        if p.is_file():
            p.unlink(missing_ok=True)

    urls = collect_urls()
    seen = set()
    saved = 0
    idx = 1

    for url in urls:
        if saved >= TARGET_COUNT:
            break
        if url in seen:
            continue
        seen.add(url)
        try:
            r = requests.get(url, timeout=30)
            if r.status_code != 200:
                continue
            data = r.content
            if not is_valid_image(data):
                continue
            ext = ".jpg"
            ctype = (r.headers.get("Content-Type") or "").lower()
            if "png" in ctype:
                ext = ".png"
            out = TARGET_DIR / f"whale_{idx:03d}{ext}"
            out.write_bytes(data)
            idx += 1
            saved += 1
        except Exception:
            continue

    print(f"Final count: {len([p for p in TARGET_DIR.iterdir() if p.is_file()])}")


if __name__ == "__main__":
    main()
