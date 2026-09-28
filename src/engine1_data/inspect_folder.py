"""Compact summary of a downloaded dataset folder, so its layout can be shared.

    python src\\engine1_data\\inspect_folder.py data\\raw\\ai4shipwrecks
"""
import sys
from collections import Counter
from pathlib import Path

root = Path(sys.argv[1])
shown = 0
for d in sorted([root] + [p for p in root.rglob("*") if p.is_dir()]):
    files = [f for f in d.iterdir() if f.is_file()]
    if not files:
        continue
    exts = Counter(f.suffix.lower() or "(none)" for f in files)
    names = [f.name for f in sorted(files)[:2]]
    print(f"{d}\n    {len(files)} files {dict(exts)}  e.g. {names}")
    shown += 1
    if shown >= 40:
        print("... (stopped after 40 folders)")
        break