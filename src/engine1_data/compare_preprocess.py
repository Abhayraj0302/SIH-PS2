"""See what each preprocessing step does to ONE real sonar tile.

    python src\\engine1_data\\compare_preprocess.py --image <path to any sonar image>

Saves data\\preview\\preprocess_compare.png with 4 panels:
    raw | Lee | Lee + normalize | Lee + normalize + CLAHE
and prints how much the speckle noise dropped (lower = smoother).
Use --x and --y to pick a tile yourself; otherwise the most textured tile is used.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

from preprocess import Preprocessor, to_gray


def speckle_level(g):
    """Median local std (5x5) divided by the image's 1..99 percentile range.
    Lower = less speckle. Dividing by the range (not the mean) keeps the number
    comparable after contrast stretching, which shifts and scales the pixel values."""
    x = g.astype(np.float32)
    m = cv2.boxFilter(x, -1, (5, 5))
    v = np.maximum(cv2.boxFilter(x * x, -1, (5, 5)) - m * m, 0)
    ok = m > 5
    if not ok.any():
        return 0.0
    lo, hi = np.percentile(g[g > 0], [1, 99])
    return float(np.median(np.sqrt(v[ok])) / max(hi - lo, 1.0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True)
    ap.add_argument("--tile", type=int, default=640)
    ap.add_argument("--x", type=int)
    ap.add_argument("--y", type=int)
    ap.add_argument("--out", default="data/preview/preprocess_compare.png")
    a = ap.parse_args()

    img = cv2.imread(a.image, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise SystemExit(f"cannot read {a.image}")
    g = to_gray(img)
    h, w = g.shape
    t = a.tile
    if a.x is None or a.y is None:
        best, bx, by = -1, 0, 0
        for y in range(0, max(1, h - t + 1), t // 2):
            for x in range(0, max(1, w - t + 1), t // 2):
                s = float(g[y:y + t, x:x + t].std())
                if s > best:
                    best, bx, by = s, x, y
        a.x, a.y = bx, by
    crop = g[a.y:a.y + t, a.x:a.x + t]
    print(f"tile at x={a.x}, y={a.y}, size {crop.shape[1]}x{crop.shape[0]}")

    steps = [("raw", Preprocessor()),
             ("Lee", Preprocessor(lee=True)),
             ("Lee+normalize", Preprocessor(lee=True, norm=True)),
             ("Lee+norm+CLAHE", Preprocessor(lee=True, norm=True, clahe=True))]
    panels = []
    for name, pre in steps:
        p = pre(crop)
        print(f"  {name:16} speckle level: {speckle_level(p):.3f}")
        p = cv2.cvtColor(p, cv2.COLOR_GRAY2BGR)
        cv2.putText(p, name, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
        panels.append(p)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(a.out, np.hstack(panels))
    print("saved", a.out)


if __name__ == "__main__":
    main()