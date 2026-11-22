#!/usr/bin/env python3
# 히로인 일러스트 후처리: 배경 제거(rembg isnet-anime) -> 투명 WebP + 얼굴 썸네일
#
# 사용법:
#   pip install "rembg[cpu]" pillow numpy scipy
#   python3 tools/process-sprites.py <원본폴더> [--h 1000] [--q 85]
# 원본폴더에는 <id>_<표정>.png (예: lia_shy.png) 가 있어야 합니다.
# 결과: assets/char/<id>/<표정>.webp, assets/char/<id>/face.webp (얼굴 중심 정사각 256px)
# 같은 캐릭터의 모든 표정에 동일한 스케일을 적용하므로 표정 교체 때 위치가 튀지 않습니다.
import sys, os, glob, argparse
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('--h', type=int, default=1000)   # 출력 높이(px)
ap.add_argument('--q', type=int, default=85)     # WebP 품질
a = ap.parse_args()

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'char')
# 얼굴 썸네일 크롭: id -> (중심x, 중심y, 한 변) — 원본 832x1216 기준 좌표
FACE = {'erion': (400, 290, 520), 'kaela': (460, 340, 520), 'lia': (420, 290, 520), 'miho': (410, 310, 540)}

from rembg import new_session, remove
sess = new_session('isnet-anime')   # 애니 일러스트 전용 모델 (최초 1회 모델 다운로드)

def cutout(im):
    """배경 제거 + 흰 테두리(halo) 제거."""
    rgba = remove(im.convert('RGB'), session=sess)
    arr = np.array(rgba).astype(np.float32)
    al = arr[..., 3] / 255.0
    # 알파 1px 침식 + 살짝 블러 -> 가장자리의 흰 띠 제거, 경계 부드럽게
    er = ndimage.minimum_filter(al, size=3)
    er = ndimage.gaussian_filter(er, 0.7)
    er = np.clip((er - 0.08) / 0.84, 0, 1)   # 희미하게 남은 배경 찌꺼기(낮은 알파) 제거
    # 반투명 픽셀은 흰 배경이 섞였다고 보고 색을 되돌림(decontaminate)
    rgb = arr[..., :3]
    m = (er > 0.02) & (er < 0.98)
    bg = 255.0
    fg = (rgb - (1 - er[..., None]) * bg) / np.maximum(er[..., None], 0.05)
    rgb = np.where(m[..., None], np.clip(fg, 0, 255), rgb)
    out = np.dstack([rgb, er * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

for p in sorted(glob.glob(os.path.join(a.src, '*_*.png'))):
    cid, face = os.path.basename(p)[:-4].split('_', 1)
    d = os.path.join(OUT, cid); os.makedirs(d, exist_ok=True)
    big = cutout(Image.open(p))
    w = round(big.width * a.h / big.height)
    big.resize((w, a.h), Image.LANCZOS).save(os.path.join(d, face + '.webp'), 'WEBP', quality=a.q, method=6)
    if face == 'normal' and cid in FACE:
        cx, cy, s = FACE[cid]
        t = big.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)).resize((256, 256), Image.LANCZOS)
        t.save(os.path.join(d, 'face.webp'), 'WEBP', quality=a.q, method=6)
    print(cid, face, os.path.getsize(os.path.join(d, face + '.webp')) // 1024, 'KB')
