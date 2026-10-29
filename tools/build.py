"""Inject the packed sprites into the page template: template.html + build-assets.json -> double-rock-sim.html."""
import json
import sys

template, assets, out = sys.argv[1], sys.argv[2], sys.argv[3]
html = open(template, encoding='utf-8').read()
data = json.load(open(assets, encoding='utf-8'))
assert html.count('__ASSETS_JSON__') == 1, 'placeholder missing'
payload = json.dumps(data, separators=(',', ':')).replace('</', '<\\/')
open(out, 'w', encoding='utf-8', newline='\n').write(html.replace('__ASSETS_JSON__', payload))
print('wrote', out, len(html) + len(payload), 'chars')
