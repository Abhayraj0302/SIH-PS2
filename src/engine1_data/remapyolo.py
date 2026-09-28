# """Remap an existing YOLO-format source (SubPipe, crab pot, MILCO/NOMBO) into
# the unified class ids from taxonomy.py.

# Objects whose source class maps to None (e.g. NOMBO) are dropped from the label
# file, so the image becomes a hard-negative background example.

#     python remap_yolo.py --images IMG_DIR --labels LBL_DIR --out OUT_DIR --source subpipe
# """
# import argparse
# from pathlib import Path

# from taxonomy import unified_id, link_or_copy

# IMG_EXT = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}


# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--images", required=True)
#     ap.add_argument("--labels", required=True)
#     ap.add_argument("--out", required=True)
#     ap.add_argument("--source", required=True, choices=["subpipe", "milco_nombo", "crab_pot"])
#     a = ap.parse_args()

#     out_lbl, out_img = Path(a.out) / "labels", Path(a.out) / "images"
#     out_lbl.mkdir(parents=True, exist_ok=True)
#     out_img.mkdir(parents=True, exist_ok=True)

#     labels = {p.stem: p for p in Path(a.labels).rglob("*.txt")}
#     kept = dropped = imgs = 0
#     for img in sorted(Path(a.images).rglob("*")):
#         if img.suffix.lower() not in IMG_EXT:
#             continue
#         lp = labels.get(img.stem)
#         lines_out = []
#         if lp is not None:
#             for line in lp.read_text().splitlines():
#                 parts = line.split()
#                 if len(parts) != 5:
#                     continue
#                 uid = unified_id(a.source, int(float(parts[0])))
#                 if uid is None:
#                     dropped += 1
#                     continue
#                 lines_out.append(" ".join([str(uid)] + parts[1:]))
#                 kept += 1
#         (out_lbl / f"{img.stem}.txt").write_text("\n".join(lines_out))
#         link_or_copy(img, out_img / img.name)
#         imgs += 1
#     print(f"{imgs} images | {kept} boxes kept | {dropped} boxes dropped as background")


# if __name__ == "__main__":
#     main()



"""Remap an existing YOLO-format source (SubPipe, crab pot, MILCO/NOMBO) into
the unified class ids from taxonomy.py.

Objects whose source class maps to None (e.g. NOMBO) are dropped from the label
file, so the image becomes a hard-negative background example.

    python remap_yolo.py --images IMG_DIR --labels LBL_DIR --out OUT_DIR --source subpipe
"""
import argparse
from pathlib import Path

from taxonomy import unified_id, save_image, IMG_EXT


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", required=True)
    ap.add_argument("--labels", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--source", required=True, choices=["subpipe", "milco_nombo", "crab_pot"])
    ap.add_argument("--skip-unlabeled", action="store_true",
                    help="ignore images that have no label file at all")
    a = ap.parse_args()

    out_lbl, out_img = Path(a.out) / "labels", Path(a.out) / "images"
    out_lbl.mkdir(parents=True, exist_ok=True)
    out_img.mkdir(parents=True, exist_ok=True)

    labels = {p.stem: p for p in Path(a.labels).rglob("*.txt")}
    kept = dropped = imgs = 0
    for img in sorted(Path(a.images).rglob("*")):
        if img.suffix.lower() not in IMG_EXT:
            continue
        lp = labels.get(img.stem)
        if lp is None and a.skip_unlabeled:
            continue
        lines_out = []
        if lp is not None:
            for line in lp.read_text().splitlines():
                parts = line.split()
                if len(parts) != 5:
                    continue
                uid = unified_id(a.source, int(float(parts[0])))
                if uid is None:
                    dropped += 1
                    continue
                lines_out.append(" ".join([str(uid)] + parts[1:]))
                kept += 1
        (out_lbl / f"{img.stem}.txt").write_text("\n".join(lines_out))
        save_image(img, out_img)
        imgs += 1
    print(f"{imgs} images | {kept} boxes kept | {dropped} boxes dropped as background")


if __name__ == "__main__":
    main()