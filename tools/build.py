"""Build the page: template.html + build-assets.json + synth.js (next to the template) -> double-rock-sim.html.

The packed sprites and sound synths replace __ASSETS_JSON__; the sound renderer replaces /*__SYNTH_JS__*/.
"""
import json
import os
import sys

template, assets, out = sys.argv[1], sys.argv[2], sys.argv[3]
html = open(template, encoding='utf-8').read()
data = json.load(open(assets, encoding='utf-8'))
synth = open(os.path.join(os.path.dirname(os.path.abspath(template)), 'synth.js'), encoding='utf-8').read()
assert html.count('__ASSETS_JSON__') == 1, 'placeholder missing'
assert html.count('/*__SYNTH_JS__*/') == 1, 'synth placeholder missing'
assert '</script' not in synth, 'synth.js would end the page script'
payload = json.dumps(data, separators=(',', ':')).replace('</', '<\\/')
page = html.replace('/*__SYNTH_JS__*/', synth.strip()).replace('__ASSETS_JSON__', payload)
open(out, 'w', encoding='utf-8', newline='\n').write(page)
print('wrote', out, len(page), 'chars')
