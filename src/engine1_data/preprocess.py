"""Shared sonar preprocessing (Engine 3).

The SAME code must run at training time (build_dataset.py) and at inference time
(dashboard / detector), otherwise the model sees different images in the two
places. Order of steps:

    1. Lee filter        - removes speckle noise, keeps edges
    2. normalize         - per-tile percentile contrast stretch, so images from
                           different sonars (SubPipe / AI4Shipwrecks / MILCO) look alike
    3. CLAHE             - local contrast boost

Every step is optional, so the ablation is simply "which flags were on".
"""
import cv2
import numpy as np


def to_gray(img):
    """Any input -> 8-bit single channel."""
    if img.ndim == 3:
        img = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    return img


def lee_filter(gray, win=5, cu=None):
    """Classic Lee (1980) speckle filter for multiplicative noise.

    In flat areas the output is the local mean (noise removed); near edges and
    objects the local variance is high, so the original pixel is kept.

    win : window size in pixels (odd). Bigger = smoother.
    cu  : speckle coefficient of variation. If None it is estimated from the
          image itself (25th percentile of the local variation, which is where
          the image is flattest). This is a heuristic; pass a number to fix it.
    """
    x = gray.astype(np.float32)
    mean = cv2.boxFilter(x, -1, (win, win), borderType=cv2.BORDER_REFLECT)
    sq = cv2.boxFilter(x * x, -1, (win, win), borderType=cv2.BORDER_REFLECT)
    var = np.maximum(sq - mean * mean, 0.0)
    ci2 = var / (mean * mean + 1e-6)              # local (coeff. of variation)^2
    if cu is None:
        valid = mean > 5                          # ignore black no-data / padding
        if not valid.any():
            return gray
        cu = float(np.percentile(np.sqrt(ci2[valid]), 25))
    k = np.clip(1.0 - (cu * cu) / (ci2 + 1e-6), 0.0, 1.0)
    out = mean + k * (x - mean)
    return np.clip(out, 0, 255).astype(np.uint8)


def normalize(gray, lo=1.0, hi=99.0):
    """Stretch the lo..hi percentile range to 0..255. Black (no-data) pixels are
    ignored when measuring the range, so the sonar nadir gap does not skew it."""
    valid = gray[gray > 0]
    if valid.size < 100:
        return gray
    a, b = np.percentile(valid, [lo, hi])
    if b - a < 5:                                 # nearly flat tile: do nothing
        return gray
    out = (gray.astype(np.float32) - a) * (255.0 / (b - a))
    return np.clip(out, 0, 255).astype(np.uint8)


class Preprocessor:
    def __init__(self, lee=False, norm=False, clahe=False, lee_win=5,
                 clip=2.0, grid=8):
        self.lee, self.norm, self.use_clahe = lee, norm, clahe
        self.lee_win, self.clip, self.grid = lee_win, clip, grid
        self._clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(grid, grid)) if clahe else None

    @property
    def enabled(self):
        return self.lee or self.norm or self.use_clahe

    def __call__(self, img):
        if not self.enabled:
            return img
        g = to_gray(img)
        if self.lee:
            g = lee_filter(g, self.lee_win)
        if self.norm:
            g = normalize(g)
        if self._clahe is not None:
            g = self._clahe.apply(g)
        return g

    def describe(self):
        return {"lee": self.lee, "lee_win": self.lee_win, "normalize": self.norm,
                "clahe": self.use_clahe, "clahe_clip": self.clip, "clahe_grid": self.grid,
                "order": "lee -> normalize -> clahe"}