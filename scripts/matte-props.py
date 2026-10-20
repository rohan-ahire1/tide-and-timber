#!/usr/bin/env python3
"""Cut prop photos out of their blue-desk background.

Adapted from an exploratory matting script. For each input photo:
  1. fit a smooth 2D quadratic surface to the blue desk background
  2. compare every pixel against that fitted background to find objects
     (very dark pixels, or pixels that don't match the fitted surface)
  3. turn background pixels into semi-transparent navy "shadow" (or fully
     transparent where there's no shadow) and keep object pixels opaque
  4. auto-crop to the alpha>0.03 bounding box with a pad, feathering the
     crop edges that don't touch the original image border
  5. export as WebP with alpha

Usage: python3 scripts/matte-props.py <in.png> <out.webp> [--pad 24] [--feather 40]
"""
import argparse
import subprocess
import sys
import tempfile
import os

import numpy as np
from PIL import Image, ImageFilter

SHADOW_RGB = np.array([0.06, 0.16, 0.28])


def fit_background(a):
    h, w, _ = a.shape
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    desk = (b - r > 0.12) & (b > 0.55) & (np.abs(g - (r + b) / 2) < 0.12)
    ys, xs = np.nonzero(desk)
    if len(xs) < 2000:
        # fall back to corners/edges if not enough obvious desk pixels
        mask = np.zeros((h, w), bool)
        mask[:20, :] = mask[-20:, :] = mask[:, :20] = mask[:, -20:] = True
        ys, xs = np.nonzero(mask)
    n = min(20000, len(xs))
    sel = np.random.default_rng(0).choice(len(xs), n, replace=False)
    X = xs[sel] / w
    Y = ys[sel] / h
    A = np.stack([np.ones_like(X), X, Y, X * X, X * Y, Y * Y], 1)
    yy, xx = np.mgrid[0:h, 0:w]
    XX = xx / w
    YY = yy / h
    AA = np.stack([np.ones_like(XX), XX, YY, XX * XX, XX * YY, YY * YY], -1)
    B = np.zeros_like(a)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, a[ys[sel], xs[sel], c], rcond=None)
        B[..., c] = AA @ coef
    return B


def matte(a):
    B = fit_background(a)
    ratio = a / np.maximum(B, 1e-3)
    m = ratio.mean(-1)
    dev = np.abs(ratio - m[..., None]).max(-1)
    obj = np.clip((dev - 0.05) / 0.07, 0, 1)
    obj = np.maximum(obj, np.clip((m - 1.06) / 0.06, 0, 1))
    obj = np.maximum(obj, np.clip((0.52 - m) / 0.08, 0, 1))  # very dark = object
    objI = Image.fromarray((obj * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    obj = np.asarray(objI).astype(float) / 255
    sh = np.clip(1 - m, 0, 1)
    sh = np.where(sh < 0.11, 0, sh)  # threshold faint shadow/background noise
    shI = Image.fromarray((sh * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MedianFilter(3))
    sh = np.asarray(shI).astype(float) / 255
    alpha = obj + (1 - obj) * sh
    alpha = np.where(alpha < 0.05, 0, alpha)
    rgb = (obj[..., None] * a + (1 - obj[..., None]) * sh[..., None] * SHADOW_RGB) / np.maximum(alpha[..., None], 1e-4)
    return np.dstack([np.clip(rgb, 0, 1), np.clip(alpha, 0, 1)])


def feather_and_crop(rgba, pad=24, feather=40):
    h, w, _ = rgba.shape
    alpha = rgba[..., 3]
    ys, xs = np.nonzero(alpha > 0.03)
    if len(xs) == 0:
        return rgba
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w - 1)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h - 1)
    crop = rgba[y0:y1 + 1, x0:x1 + 1].copy()
    ch, cw, _ = crop.shape
    fade = np.ones((ch, cw), float)
    ramp = np.linspace(0, 1, feather)
    touches_top, touches_bottom = y0 == 0, y1 == h - 1
    touches_left, touches_right = x0 == 0, x1 == w - 1
    if not touches_top:
        fade[:feather, :] *= ramp[:, None]
    if not touches_bottom:
        fade[-feather:, :] *= ramp[::-1][:, None]
    if not touches_left:
        fade[:, :feather] *= ramp[None, :]
    if not touches_right:
        fade[:, -feather:] *= ramp[::-1][None, :]
    crop[..., 3] *= fade
    return crop


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--pad', type=int, default=24)
    ap.add_argument('--feather', type=int, default=40)
    ap.add_argument('--quality', type=int, default=86)
    args = ap.parse_args()

    im = Image.open(args.src).convert('RGB')
    a = np.asarray(im).astype(float) / 255
    rgba = matte(a)
    rgba = feather_and_crop(rgba, args.pad, args.feather)
    out_png = tempfile.mktemp(suffix='.png')
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(out_png)
    os.makedirs(os.path.dirname(args.dst) or '.', exist_ok=True)
    subprocess.run(['cwebp', '-q', str(args.quality), '-alpha_q', '90', out_png, '-o', args.dst], check=True)
    os.remove(out_png)
    print(f'{args.src} -> {args.dst}  {rgba.shape[1]}x{rgba.shape[0]}')


if __name__ == '__main__':
    main()
