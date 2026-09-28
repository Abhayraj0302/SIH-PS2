# """Single source of truth for the unified class list (Engine 1 / Engine 2)."""

# CLASSES = ["pipe", "shipwreck", "mine_like", "crab_pot"]
# CLASS_ID = {name: i for i, name in enumerate(CLASSES)}

# # source class id -> unified class name. None = keep the image but treat the
# # object as BACKGROUND (hard negative), e.g. NOMBO = non-mine-like bottom object.
# # NOTE: ids below are placeholders until the real downloaded label files are
# # inspected. Confirm them (esp. MILCO vs NOMBO) before training.
# SOURCE_MAPS = {
#     "subpipe": {0: "pipe"},
#     "ai4shipwrecks": {"mask": "shipwreck"},   # binary mask -> boxes
#     "milco_nombo": {0: "mine_like", 1: None},  # VERIFY which id is MILCO / NOMBO
#     "crab_pot": {0: "crab_pot"},
# }


# def link_or_copy(src, dst):
#     """Symlink the image; on Windows (no symlink permission) copy it instead."""
#     import os, shutil
#     from pathlib import Path
#     src, dst = Path(src), Path(dst)
#     if dst.exists():
#         return
#     try:
#         os.symlink(src.resolve(), dst)
#     except OSError:
#         shutil.copy2(src, dst)


# def unified_id(source: str, src_class):
#     """Return unified class id, or None if the object should be dropped."""
#     name = SOURCE_MAPS[source][src_class]
#     return None if name is None else CLASS_ID[name]


"""Single source of truth for the unified class list (Engine 1 / Engine 2)."""

CLASSES = ["pipe", "shipwreck", "mine_like", "crab_pot"]
CLASS_ID = {name: i for i, name in enumerate(CLASSES)}

# source class id -> unified class name. None = keep the image but treat the
# object as BACKGROUND (hard negative), e.g. NOMBO = non-mine-like bottom object.
# NOTE: ids below are placeholders until the real downloaded label files are
# inspected. Confirm them (esp. MILCO vs NOMBO) before training.
SOURCE_MAPS = {
    "subpipe": {0: "pipe"},
    "ai4shipwrecks": {"mask": "shipwreck"},   # binary mask -> boxes
    "milco_nombo": {0: "mine_like", 1: None},  # VERIFY which id is MILCO / NOMBO
    "crab_pot": {0: "crab_pot"},
}


IMG_EXT = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".pbm", ".pgm", ".ppm"}
# YOLO/Ultralytics cannot read these, so they are converted to PNG.
CONVERT_EXT = {".pbm", ".pgm", ".ppm"}


def save_image(src, dst_dir):
    """Put an image into dst_dir. PBM/PGM/PPM (SubPipe) -> 8-bit PNG, same stem.
    Others: symlink, or copy if symlinks are not allowed (Windows)."""
    import os, shutil
    import cv2
    import numpy as np
    from pathlib import Path
    src, dst_dir = Path(src), Path(dst_dir)
    if src.suffix.lower() in CONVERT_EXT:
        dst = dst_dir / (src.stem + ".png")
        if dst.exists():
            return
        img = cv2.imread(str(src), cv2.IMREAD_UNCHANGED)
        if img is None:
            raise RuntimeError(f"cannot read {src}")
        if img.dtype != np.uint8:
            img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        elif img.max() == 1:
            img = img * 255
        cv2.imwrite(str(dst), img)
        return
    dst = dst_dir / src.name
    if dst.exists():
        return
    try:
        os.symlink(src.resolve(), dst)
    except OSError:
        shutil.copy2(src, dst)


def unified_id(source: str, src_class):
    """Return unified class id, or None if the object should be dropped."""
    name = SOURCE_MAPS[source][src_class]
    return None if name is None else CLASS_ID[name]