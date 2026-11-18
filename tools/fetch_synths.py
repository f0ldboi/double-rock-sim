"""Add the fight's sound effects to the assets: fetch their synths (cache index 4) from the OpenRS2 archive.

usage: fetch_synths.py <assets json> <openrs2 cache id>
OSRS stores sound effects as small synth programs and renders them as it plays; synth.js ports that renderer, so the page
ships each synth's few hundred bytes instead of audio. Ids and names are Jagex's, from RuneLite's gameval SoundEffectID.
"""
import base64
import bz2
import gzip
import json
import struct
import sys
import time
import urllib.request

SOUNDS = {
    # DOM_ROCK_THROW_ATTACK (sequence 12407) frame sounds
    10362: 'DELVE_BOSS_STD_ROCK_ATTACK_HISS_01',
    10291: 'DELVE_BOSS_STD_ROCK_ATTACK_02',
    10292: 'DELVE_BOSS_STD_ROCK_ATTACK_01',
    10371: 'DELVE_BOSS_STD_ROCK_ATTACK_WHOOSH_01',
    10338: 'DELVE_BOSS_STD_ROCK_SHIELD_OPEN_01',
    # each burst, and each rock's boulder and debris landing
    10331: 'DELVE_BOSS_STD_ROCK_ATTACK_EXPLOSION_01',
    10297: 'DELVE_BOSS_STD_ROCK_ATTACK_IMPACT_01',
    # the barrage hits reuse the Leviathan's magic and ranged impacts
    7023: 'DT2_LEVBOSS_MAGIC_IMPACT_SOUND_01',
    7026: 'DT2_LEVBOSS_RANGED_IMPACT_SOUND_01',
    # prayers on and off
    2675: 'PROTECT_FROM_MAGIC',
    2677: 'PROTECT_FROM_MISSILES',
    2676: 'PROTECT_FROM_MELEE',
    2663: 'CANCEL_PRAYER',
    # you, getting hit and dying
    513: 'HUMAN_HIT',
    514: 'HUMAN_HIT2',
    515: 'HUMAN_HIT3',
    516: 'HUMAN_HIT4',
    517: 'HUMAN_HIT5',
    512: 'HUMAN_DEATH',
}

path, cache = sys.argv[1], sys.argv[2]


def unpack(c):
    kind, clen = c[0], struct.unpack('>I', c[1:5])[0]
    if kind == 0:
        return c[5:5 + clen]
    body = c[9:9 + clen]
    return bz2.decompress(b'BZh1' + body) if kind == 1 else gzip.decompress(body)


assets = json.load(open(path, encoding='utf-8'))
synths = {}
for sid in sorted(SOUNDS):
    url = f'https://archive.openrs2.org/caches/runescape/{cache}/archives/4/groups/{sid}.dat'
    req = urllib.request.Request(url, headers={'User-Agent': 'DoubleRockSim (https://github.com/f0ldboi/double-rock-sim)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        synths[str(sid)] = base64.b64encode(unpack(r.read())).decode('ascii')
    time.sleep(0.15)
assets['synths'] = synths
json.dump(assets, open(path, 'w', encoding='utf-8'))
print('synths', len(synths), 'from cache', cache, 'base64 chars', sum(len(v) for v in synths.values()))
