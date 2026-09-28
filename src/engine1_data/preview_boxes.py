"""Draw the converted boxes on a few images so you can SEE if labels are right.

    python src\\engine1_data\\preview_boxes.py --root data\\unified\\subpipe_hf --n 6

Saves PNGs into data\\preview\\<source name>\\ (open them in VS Code).
Use --empty to preview background-only images (no label) instead.
"""
import argparse
import random
from pathlib import Path

import cv2

from taxonomy import CLASSES


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="folder that has images/ and labels/")
    ap.add_argument("--n", type=int, default=6)
    ap.add_argument("--empty", action="store_true")
    ap.add_argument("--out", default="data/preview")
    a = ap.parse_args()

    root = Path(a.root)
    out = Path(a.out) / root.name
    out.mkdir(parents=True, exist_ok=True)

    pool = []
    for lp in (root / "labels").glob("*.txt"):
        rows = [r.split() for r in lp.read_text().splitlines() if r.strip()]
        if bool(rows) != a.empty:
            pool.append((lp, rows))
    random.seed(0)
    for lp, rows in random.sample(pool, min(a.n, len(pool))):
        imgs = list((root / "images").glob(lp.stem + ".*"))
        if not imgs:
            continue
        img = cv2.imread(str(imgs[0]))
        h, w = img.shape[:2]
        for c, cx, cy, bw, bh in [(int(r[0]), *map(float, r[1:5])) for r in rows]:
            x1, y1 = int((cx - bw / 2) * w), int((cy - bh / 2) * h)
            x2, y2 = int((cx + bw / 2) * w), int((cy + bh / 2) * h)
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)
            cv2.putText(img, CLASSES[c], (x1, max(20, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
        cv2.imwrite(str(out / f"{lp.stem}.png"), img)
    print(f"saved {min(a.n, len(pool))} previews to {out}")


if __name__ == "__main__":
    main()