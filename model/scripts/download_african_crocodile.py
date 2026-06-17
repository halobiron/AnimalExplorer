from pathlib import Path
from io import BytesIO
import tarfile
import requests
from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parent.parent
TARGET_DIR = PROJECT_ROOT / "dataset_raw" / "animals" / "animals" / "african_crocodile"
TARGET_COUNT = 60
SYNSET = "n01697457"  # African crocodile / Nile crocodile
TAR_URL = f"https://image-net.org/data/winter21_whole/{SYNSET}.tar"
TMP_DIR = PROJECT_ROOT / "scripts" / "_tmp_african_crocodile"
TMP_TAR = TMP_DIR / f"{SYNSET}.tar"
EXTRACT_DIR = TMP_DIR / "extract"


def is_image_ok(path: Path) -> bool:
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:
        return False


def ensure_dirs() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)


def download_tar() -> None:
    with requests.get(TAR_URL, stream=True, timeout=120) as r:
        r.raise_for_status()
        with TMP_TAR.open("wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)


def extract_tar() -> None:
    for p in EXTRACT_DIR.glob("*"):
        if p.is_file():
            p.unlink(missing_ok=True)
    with tarfile.open(TMP_TAR, "r") as tf:
        tf.extractall(EXTRACT_DIR)


def main() -> None:
    ensure_dirs()

    existing = sorted([p for p in TARGET_DIR.iterdir() if p.is_file()])
    valid_existing = []
    for p in existing:
        if is_image_ok(p):
            valid_existing.append(p)
        else:
            p.unlink(missing_ok=True)

    if len(valid_existing) >= TARGET_COUNT:
        print(f"Already have {len(valid_existing)} valid images.")
        return

    download_tar()
    extract_tar()

    source_imgs = []
    for p in EXTRACT_DIR.iterdir():
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png"} and is_image_ok(p):
            source_imgs.append(p)

    current = len(valid_existing)
    need = max(0, TARGET_COUNT - current)
    idx = current + 1
    copied = 0

    for src in source_imgs:
        if copied >= need:
            break
        ext = ".jpg" if src.suffix.lower() not in {".jpg", ".jpeg", ".png"} else src.suffix.lower()
        dst = TARGET_DIR / f"african_crocodile_{idx:03d}{ext}"
        dst.write_bytes(src.read_bytes())
        idx += 1
        copied += 1

    final_count = len([p for p in TARGET_DIR.iterdir() if p.is_file()])
    print(f"Final count: {final_count}")


if __name__ == "__main__":
    main()
