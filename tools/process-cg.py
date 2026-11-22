#!/usr/bin/env python3
"""이벤트 CG 처리: 리사이즈 + webp 변환만 한다 (배경 제거 없음).

입력  : <id>.png 또는 <id>_scene.png (ComfyUI 배치 결과)
출력  : assets/cg/<id>.webp
사용  : python3 tools/process-cg.py <입력 폴더 또는 파일...> [--h 1280] [--q 82] [--out assets/cg]
높이는 --h 보다 클 때만 줄인다(확대 없음).
"""
import argparse
import os
import sys

from PIL import Image


def cg_id(path):
    name = os.path.splitext(os.path.basename(path))[0]
    return name[:-6] if name.endswith("_scene") else name


def collect(inputs):
    files = []
    for p in inputs:
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                if f.lower().endswith(".png"):
                    files.append(os.path.join(p, f))
        elif os.path.isfile(p):
            files.append(p)
    return files


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--h", type=int, default=1280, help="최대 높이(기본 1280, 축소만)")
    ap.add_argument("--q", type=int, default=82, help="webp 품질(기본 82)")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "cg"))
    a = ap.parse_args()
    files = collect(a.inputs)
    if not files:
        print("처리할 png 가 없습니다.")
        return 1
    os.makedirs(a.out, exist_ok=True)
    for f in files:
        im = Image.open(f).convert("RGB")
        if im.height > a.h:
            w = round(im.width * a.h / im.height)
            im = im.resize((w, a.h), Image.LANCZOS)
        dst = os.path.join(a.out, cg_id(f) + ".webp")
        im.save(dst, "WEBP", quality=a.q, method=6)
        print("%s -> %s (%dx%d, %d KB)" % (f, dst, im.width, im.height, os.path.getsize(dst) // 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
