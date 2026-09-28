"""Sanity-check the unified dataset before any training.

Expected layout:  ROOT/<source>/images/*  and  ROOT/<source>/labels/*.txt
    python validate_dataset.py --root data/unified
"""
import argparse
from collections import Counter
from pathlib import Path

from taxonomy import CLASSES


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    a = ap.parse_args()

    problems = 0
    for src in sorted(p for p in Path(a.root).iterdir() if p.is_dir()):
        counts, empty, total = Counter(), 0, 0
        for lp in sorted((src / "labels").glob("*.txt")):
            total += 1
            if not any((src / "images").glob(lp.stem + ".*")):
                print(f"[{src.name}] label without image: {lp.name}")
                problems += 1
            rows = [r.split() for r in lp.read_text().splitlines() if r.strip()]
            if not rows:
                empty += 1
            for r in rows:
                try:
                    c, *xywh = int(r[0]), *map(float, r[1:5])
                    ok = 0 <= c < len(CLASSES) and all(0 <= v <= 1 for v in xywh) \
                        and xywh[2] > 0 and xywh[3] > 0
                except (ValueError, IndexError):
                    ok = False
                if not ok:
                    print(f"[{src.name}] bad row in {lp.name}: {' '.join(r)}")
                    problems += 1
                else:
                    counts[CLASSES[c]] += 1
        print(f"[{src.name}] {total} label files | {empty} background-only | "
              f"boxes: {dict(counts) or 'none'}")
    print("OK" if problems == 0 else f"{problems} problem(s) found")


if __name__ == "__main__":
    main()