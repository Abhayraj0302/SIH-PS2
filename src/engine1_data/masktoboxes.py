# # """Binary segmentation mask -> YOLO boxes via connected components.

# # Used for AI4Shipwrecks (pixel masks). Run this on the FULL-resolution image
# # BEFORE tiling, so a wreck is never split into fragments by the mask step;
# # Engine 3 then tiles the image and clips the boxes to each tile.

# #     python mask_to_boxes.py --images IMG_DIR --masks MASK_DIR --out OUT_DIR \
# #         --source ai4shipwrecks
# # """
# # import argparse
# # from pathlib import Path

# # import cv2
# # import numpy as np

# # from taxonomy import SOURCE_MAPS, CLASS_ID, link_or_copy

# # IMG_EXT = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}


# # def mask_to_boxes(mask, min_area=100, close_px=25, pad=6):
# #     """Return list of (x1, y1, x2, y2) pixel boxes, one per connected blob.

# #     close_px : morphological closing size. Wreck masks often break into a bright
# #                return + a separate shadow; closing merges them into one object.
# #     min_area : drop specks (pixels) after closing.
# #     pad      : small margin so the box is not cropped tight to the mask.
# #     """
# #     binary = (mask > 0).astype(np.uint8)
# #     if close_px > 1:
# #         k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_px, close_px))
# #         binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, k)
# #     n, _, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
# #     h, w = binary.shape
# #     boxes = []
# #     for i in range(1, n):  # 0 = background
# #         x, y, bw, bh, area = stats[i]
# #         if area < min_area:
# #             continue
# #         boxes.append((max(0, x - pad), max(0, y - pad),
# #                       min(w, x + bw + pad), min(h, y + bh + pad)))
# #     return boxes


# # def to_yolo_lines(boxes, img_w, img_h, class_id):
# #     lines = []
# #     for x1, y1, x2, y2 in boxes:
# #         cx, cy = (x1 + x2) / 2 / img_w, (y1 + y2) / 2 / img_h
# #         bw, bh = (x2 - x1) / img_w, (y2 - y1) / img_h
# #         lines.append(f"{class_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")
# #     return lines


# # def main():
# #     ap = argparse.ArgumentParser()
# #     ap.add_argument("--images", required=True)
# #     ap.add_argument("--masks", required=True)
# #     ap.add_argument("--out", required=True)
# #     ap.add_argument("--source", default="ai4shipwrecks")
# #     ap.add_argument("--min-area", type=int, default=100)
# #     ap.add_argument("--close-px", type=int, default=25)
# #     a = ap.parse_args()

# #     class_id = CLASS_ID[SOURCE_MAPS[a.source]["mask"]]
# #     out_lbl = Path(a.out) / "labels"
# #     out_img = Path(a.out) / "images"
# #     out_lbl.mkdir(parents=True, exist_ok=True)
# #     out_img.mkdir(parents=True, exist_ok=True)

# #     masks = {p.stem: p for p in Path(a.masks).rglob("*") if p.suffix.lower() in IMG_EXT}
# #     done = skipped = 0
# #     for img_path in sorted(Path(a.images).rglob("*")):
# #         if img_path.suffix.lower() not in IMG_EXT:
# #             continue
# #         mp = masks.get(img_path.stem)
# #         if mp is None:
# #             skipped += 1
# #             continue
# #         mask = cv2.imread(str(mp), cv2.IMREAD_GRAYSCALE)
# #         h, w = mask.shape
# #         lines = to_yolo_lines(mask_to_boxes(mask, a.min_area, a.close_px), w, h, class_id)
# #         (out_lbl / f"{img_path.stem}.txt").write_text("\n".join(lines))
# #         link_or_copy(img_path, out_img / img_path.name)
# #         done += 1
# #     print(f"converted {done} images, {skipped} without a matching mask")


# # if __name__ == "__main__":
# #     main()




# """Binary segmentation mask -> YOLO boxes via connected components.

# Used for AI4Shipwrecks (pixel masks). Run this on the FULL-resolution image
# BEFORE tiling, so a wreck is never split into fragments by the mask step;
# Engine 3 then tiles the image and clips the boxes to each tile.

#     python mask_to_boxes.py --images IMG_DIR --masks MASK_DIR --out OUT_DIR \
#         --source ai4shipwrecks
# """
# import argparse
# from pathlib import Path

# import cv2
# import numpy as np

# from taxonomy import SOURCE_MAPS, CLASS_ID, save_image, IMG_EXT


# def mask_to_boxes(mask, min_area=100, close_px=25, pad=6):
#     """Return list of (x1, y1, x2, y2) pixel boxes, one per connected blob.

#     close_px : morphological closing size. Wreck masks often break into a bright
#                return + a separate shadow; closing merges them into one object.
#     min_area : drop specks (pixels) after closing.
#     pad      : small margin so the box is not cropped tight to the mask.
#     """
#     binary = (mask > 0).astype(np.uint8)
#     if close_px > 1:
#         k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_px, close_px))
#         binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, k)
#     n, _, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
#     h, w = binary.shape
#     boxes = []
#     for i in range(1, n):  # 0 = background
#         x, y, bw, bh, area = stats[i]
#         if area < min_area:
#             continue
#         boxes.append((max(0, x - pad), max(0, y - pad),
#                       min(w, x + bw + pad), min(h, y + bh + pad)))
#     return boxes


# def to_yolo_lines(boxes, img_w, img_h, class_id):
#     lines = []
#     for x1, y1, x2, y2 in boxes:
#         cx, cy = (x1 + x2) / 2 / img_w, (y1 + y2) / 2 / img_h
#         bw, bh = (x2 - x1) / img_w, (y2 - y1) / img_h
#         lines.append(f"{class_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")
#     return lines


# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--images", required=True)
#     ap.add_argument("--masks", required=True)
#     ap.add_argument("--out", required=True)
#     ap.add_argument("--source", default="ai4shipwrecks")
#     ap.add_argument("--min-area", type=int, default=100)
#     ap.add_argument("--close-px", type=int, default=25)
#     a = ap.parse_args()

#     class_id = CLASS_ID[SOURCE_MAPS[a.source]["mask"]]
#     out_lbl = Path(a.out) / "labels"
#     out_img = Path(a.out) / "images"
#     out_lbl.mkdir(parents=True, exist_ok=True)
#     out_img.mkdir(parents=True, exist_ok=True)

#     masks = {p.stem: p for p in Path(a.masks).rglob("*") if p.suffix.lower() in IMG_EXT}
#     done = skipped = 0
#     for img_path in sorted(Path(a.images).rglob("*")):
#         if img_path.suffix.lower() not in IMG_EXT:
#             continue
#         mp = masks.get(img_path.stem)
#         if mp is None:
#             skipped += 1
#             continue
#         mask = cv2.imread(str(mp), cv2.IMREAD_GRAYSCALE)
#         h, w = mask.shape
#         lines = to_yolo_lines(mask_to_boxes(mask, a.min_area, a.close_px), w, h, class_id)
#         (out_lbl / f"{img_path.stem}.txt").write_text("\n".join(lines))
#         save_image(img_path, out_img)
#         done += 1
#     print(f"converted {done} images, {skipped} without a matching mask")


# if __name__ == "__main__":
#     main()


"""Binary segmentation mask -> YOLO boxes via connected components.

Used for AI4Shipwrecks (pixel masks). Run this on the FULL-resolution image
BEFORE tiling, so a wreck is never split into fragments by the mask step;
Engine 3 then tiles the image and clips the boxes to each tile.

    python mask_to_boxes.py --images IMG_DIR --masks MASK_DIR --out OUT_DIR \
        --source ai4shipwrecks
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

from taxonomy import SOURCE_MAPS, CLASS_ID, save_image, IMG_EXT


def merge_close_boxes(boxes, gap):
    """Merge boxes whose gap is <= gap px (fragments of one object)."""
    boxes = [list(b) for b in boxes]
    changed = True
    while changed:
        changed, out = False, []
        while boxes:
            a = boxes.pop()
            i = 0
            while i < len(boxes):
                b = boxes[i]
                if (a[0] - gap <= b[2] and b[0] - gap <= a[2]
                        and a[1] - gap <= b[3] and b[1] - gap <= a[3]):
                    a = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]
                    boxes.pop(i)
                    changed = True
                    i = 0  # box grew, re-check the others
                else:
                    i += 1
            out.append(a)
        boxes = out
    return [tuple(b) for b in boxes]


def mask_to_boxes(mask, min_area=100, close_px=25, pad=6, merge_gap=0):
    """Return list of (x1, y1, x2, y2) pixel boxes, one per object.

    close_px  : morphological closing size (joins blobs closer than this).
    min_area  : drop specks (pixels) after closing.
    merge_gap : then merge boxes closer than this many pixels. Wreck masks often
                come as many separate pieces (bright returns, shadows, debris);
                this turns the pieces of one wreck into ONE box.
    pad       : small margin so the box is not cropped tight to the mask.
    """
    binary = (mask > 0).astype(np.uint8)
    if close_px > 1:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_px, close_px))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, k)
    n, _, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    h, w = binary.shape
    boxes = []
    for i in range(1, n):  # 0 = background
        x, y, bw, bh, area = stats[i]
        if area >= min_area:
            boxes.append((x, y, x + bw, y + bh))
    if merge_gap > 0 and len(boxes) > 1:
        boxes = merge_close_boxes(boxes, merge_gap)
    return [(max(0, x1 - pad), max(0, y1 - pad), min(w, x2 + pad), min(h, y2 + pad))
            for x1, y1, x2, y2 in boxes]


def to_yolo_lines(boxes, img_w, img_h, class_id):
    lines = []
    for x1, y1, x2, y2 in boxes:
        cx, cy = (x1 + x2) / 2 / img_w, (y1 + y2) / 2 / img_h
        bw, bh = (x2 - x1) / img_w, (y2 - y1) / img_h
        lines.append(f"{class_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", required=True)
    ap.add_argument("--masks", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--source", default="ai4shipwrecks")
    ap.add_argument("--min-area", type=int, default=100)
    ap.add_argument("--close-px", type=int, default=25)
    ap.add_argument("--merge-gap", type=int, default=100,
                    help="merge boxes closer than this many px (0 = off)")
    a = ap.parse_args()

    class_id = CLASS_ID[SOURCE_MAPS[a.source]["mask"]]
    out_lbl = Path(a.out) / "labels"
    out_img = Path(a.out) / "images"
    out_lbl.mkdir(parents=True, exist_ok=True)
    out_img.mkdir(parents=True, exist_ok=True)

    masks = {p.stem: p for p in Path(a.masks).rglob("*") if p.suffix.lower() in IMG_EXT}
    done = skipped = 0
    for img_path in sorted(Path(a.images).rglob("*")):
        if img_path.suffix.lower() not in IMG_EXT:
            continue
        mp = masks.get(img_path.stem)
        if mp is None:
            skipped += 1
            continue
        mask = cv2.imread(str(mp), cv2.IMREAD_GRAYSCALE)
        h, w = mask.shape
        lines = to_yolo_lines(mask_to_boxes(mask, a.min_area, a.close_px, merge_gap=a.merge_gap), w, h, class_id)
        (out_lbl / f"{img_path.stem}.txt").write_text("\n".join(lines))
        save_image(img_path, out_img)
        done += 1
    print(f"converted {done} images, {skipped} without a matching mask")


if __name__ == "__main__":
    main()