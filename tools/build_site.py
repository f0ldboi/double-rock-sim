"""Wrap the built sim in a complete web page, for hosting it as an ordinary website.

usage: build_site.py <built sim html> <assets json> <out dir> [site url]

The artifact viewer supplies the doctype, charset and viewport itself; an ordinary web host does not.
Given the site's address, the link preview that Discord and Reddit show (Open Graph) gets its absolute URLs too.
"""
import json
import os
import sys

src, assets, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
url = sys.argv[4].rstrip('/') + '/' if len(sys.argv) > 4 else None
html = open(src, encoding='utf-8').read()
icons = json.load(open(assets, encoding='utf-8'))['icons']

cut = html.index('\n<div class="app">')
head, body = html[:cut], html[cut + 1:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
assert head.count('<title>Double Rock Sim</title>') == 1
head = head.replace('<title>Double Rock Sim</title>', '<title>Double Rock Sim · OSRS Doom of Mokhaiotl practice</title>')

desc = 'Practice Doom delve 8+ double rocks.'
meta = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    f'<meta name="description" content="{desc}">',
    '<meta name="theme-color" content="#120e0a">',
    f'<link rel="icon" href="{icons["Protect from Magic"]}">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="Double Rock Sim">',
    f'<meta property="og:description" content="{desc}">',
]
if url:
    meta += [
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{url}preview.png">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]

page = '<!doctype html>\n<html lang="en">\n<head>\n' + '\n'.join(meta) + '\n' + head + '\n</head>\n<body>\n' + body.rstrip('\n') + '\n</body>\n</html>\n'
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, 'index.html')
open(out, 'w', encoding='utf-8', newline='\n').write(page)
print('wrote', out, len(page), 'chars', '(with link preview URLs)' if url else '(add the site url for link preview images)')
