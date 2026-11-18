"""Pack the OSRS Wiki sprites into data URIs for the sim (assets.json).

usage: build_assets.py <wiki sprite dir> <spec orb dir> <out.json>
"""
import base64
import json
import os
import sys

import cv2
import numpy as np

SRC, ORB, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

ICONS = [
    'Protect from Magic', 'Protect from Missiles', 'Protect from Melee',
    'Protect from Magic overhead', 'Protect from Missiles overhead', 'Protect from Melee overhead',
    'Protect from Magic and Missiles overhead',
    'Damage hitsplat', 'Zero damage hitsplat', 'Prayer icon',
]


def uri(img, ext, params):
    ok, buf = cv2.imencode(ext, img, params)
    assert ok, ext
    mime = 'image/png' if ext == '.png' else 'image/webp'
    return f'data:{mime};base64,' + base64.b64encode(buf.tobytes()).decode('ascii')


def crop_alpha(img):
    ys, xs = np.nonzero(img[:, :, 3] > 8)
    return img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


out = {'icons': {}, 'meta': {}}
for name in ICONS:
    img = cv2.imread(os.path.join(SRC, name.replace(' ', '_') + '.png'), cv2.IMREAD_UNCHANGED)
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    out['icons'][name] = uri(img, '.png', [cv2.IMWRITE_PNG_COMPRESSION, 9])
    out['meta'][name] = [img.shape[1], img.shape[0]]

# special attack orb: the PNG is the orb with transparency; the GIF's second frame is the activated orb with the same outline
off = cv2.imread(os.path.join(ORB, 'Special_attack_orb.png'), cv2.IMREAD_UNCHANGED)
cap = cv2.VideoCapture(os.path.join(ORB, 'Special_attack_orb.gif'))
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
assert len(frames) == 2 and frames[1].shape[:2] == off.shape[:2], 'unexpected orb gif'
on = np.dstack([frames[1], off[:, :, 3]])
for name, img in (('Special attack orb', off), ('Special attack orb on', on)):
    out['icons'][name] = uri(img, '.png', [cv2.IMWRITE_PNG_COMPRESSION, 9])
    out['meta'][name] = [img.shape[1], img.shape[0]]

doom = crop_alpha(cv2.imread(os.path.join(SRC, 'Doom_of_Mokhaiotl.png'), cv2.IMREAD_UNCHANGED))
dw = 760
doom = cv2.resize(doom, (dw, round(doom.shape[0] * dw / doom.shape[1])), interpolation=cv2.INTER_AREA)
out['doom'] = uri(doom, '.webp', [cv2.IMWRITE_WEBP_QUALITY, 88])
out['meta']['doom'] = [doom.shape[1], doom.shape[0]]

player = crop_alpha(cv2.imread(os.path.join(SRC, 'player_Twisted_bow_equipped_male.png'), cv2.IMREAD_UNCHANGED))
ph = 300
player = cv2.resize(player, (round(player.shape[1] * ph / player.shape[0]), ph), interpolation=cv2.INTER_AREA)
a = player[:, :, 3]
rows = a[int(ph * 0.94):]
feet = np.nonzero(rows.max(axis=0) > 20)[0]
out['player'] = uri(player, '.webp', [cv2.IMWRITE_WEBP_QUALITY, 90])
out['meta']['player'] = [player.shape[1], player.shape[0], round(float((feet.min() + feet.max()) / 2 / player.shape[1]), 3)]

json.dump(out, open(OUT, 'w'))
total = sum(len(v) for v in out['icons'].values()) + len(out['doom']) + len(out['player'])
print('icons', len(out['icons']), 'doom', out['meta']['doom'], len(out['doom']), 'player', out['meta']['player'], len(out['player']), 'total chars', total)
