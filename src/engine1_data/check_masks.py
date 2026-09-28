# """Explain WHY a mask folder produced many boxes or empty images.

#     python src\\engine1_data\\check_masks.py --masks <folder with mask PNGs> --n 15

# For each mask prints: image size, distinct pixel values, non-zero pixel count,
# blobs before closing, blobs after closing, and how many survive min-area.
# """
# import argparse
# from pathlib import Path

# import cv2
# import numpy as np

# from taxonomy import IMG_EXT
# try:
#     from mask_to_boxes import mask_to_boxes
# except ImportError:  # file was saved without underscores
#     from masktoboxes import mask_to_boxes


# def blobs(binary):
#     return cv2.connectedComponents(binary.astype(np.uint8), connectivity=8)[0] - 1


# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--masks", required=True)
#     ap.add_argument("--n", type=int, default=15)
#     ap.add_argument("--min-area", type=int, default=100)
#     ap.add_argument("--close-px", type=int, default=25)
#     a = ap.parse_args()

#     files = sorted(p for p in Path(a.masks).rglob("*") if p.suffix.lower() in IMG_EXT)
#     print(f"{len(files)} masks found; showing {min(a.n, len(files))}")
#     print(f"{'file':32} {'size':>11} {'values':>14} {'nonzero':>9} {'raw':>4} {'closed':>6} {'kept':>4}")
#     for p in files[: a.n]:
#         m = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
#         vals = np.unique(m)
#         b = (m > 0).astype(np.uint8)
#         k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (a.close_px, a.close_px))
#         closed = cv2.morphologyEx(b, cv2.MORPH_CLOSE, k)
#         kept = len(mask_to_boxes(m, a.min_area, a.close_px))
#         vs = ",".join(map(str, vals[:4])) + ("..." if len(vals) > 4 else "")
#         print(f"{p.name[:32]:32} {m.shape[1]}x{m.shape[0]:<5} {vs:>14} {int(b.sum()):>9} "
#               f"{blobs(b):>4} {blobs(closed):>6} {kept:>4}")


# if __name__ == "__main__":
#     main()



"""Explain WHY a mask folder produced many boxes or empty images.

    python src\\engine1_data\\check_masks.py --masks <folder with mask PNGs> --n 15

For each mask prints: image size, distinct pixel values, non-zero pixel count,
blobs before closing, blobs after closing, and how many survive min-area.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

from taxonomy import IMG_EXT
try:
    from mask_to_boxes import mask_to_boxes
except ImportError:  # file was saved without underscores
    from masktoboxes import mask_to_boxes


def blobs(binary):
    return cv2.connectedComponents(binary.astype(np.uint8), connectivity=8)[0] - 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--masks", required=True)
    ap.add_argument("--n", type=int, default=15)
    ap.add_argument("--min-area", type=int, default=100)
    ap.add_argument("--close-px", type=int, default=25)
    ap.add_argument("--merge-gap", type=int, default=100)
    a = ap.parse_args()

    files = sorted(p for p in Path(a.masks).rglob("*") if p.suffix.lower() in IMG_EXT)
    print(f"{len(files)} masks found; showing {min(a.n, len(files))}")
    print(f"{'file':32} {'size':>11} {'values':>14} {'nonzero':>9} {'raw':>4} {'closed':>6} {'kept':>4} {'merged':>6}")
    for p in files[: a.n]:
        m = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        vals = np.unique(m)
        b = (m > 0).astype(np.uint8)
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (a.close_px, a.close_px))
        closed = cv2.morphologyEx(b, cv2.MORPH_CLOSE, k)
        kept = len(mask_to_boxes(m, a.min_area, a.close_px))
        merged = len(mask_to_boxes(m, a.min_area, a.close_px, merge_gap=a.merge_gap))
        vs = ",".join(map(str, vals[:4])) + ("..." if len(vals) > 4 else "")
        print(f"{p.name[:32]:32} {m.shape[1]}x{m.shape[0]:<5} {vs:>14} {int(b.sum()):>9} "
              f"{blobs(b):>4} {blobs(closed):>6} {kept:>4} {merged:>6}")


if __name__ == "__main__":
    main()