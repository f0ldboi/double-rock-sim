#!/bin/bash
# Build the page, append the test harness, run it in headless Chrome and print the harness output.
# PYTHON and CHROME override the interpreter and the browser (default: Chrome's usual Windows path).
cd "$(dirname "$0")/.." || exit 1
PY=${PYTHON:-python}
CHROME=${CHROME:-"/c/Program Files/Google/Chrome/Application/chrome.exe"}
"$PY" -I tools/build.py "$PWD/template.html" "$PWD/build-assets.json" "$PWD/double-rock-sim.html" || exit 1
cat double-rock-sim.html test/harness-tail.html > test/harness.html
W=$(cygpath -m "$PWD" 2>/dev/null || echo "$PWD")
timeout 150 "$CHROME" --headless=new --disable-gpu \
  --user-data-dir="$W/test/chrome-profile" --window-size=1280,1500 --virtual-time-budget=20000 \
  --dump-dom "file:///${W#/}/test/harness.html" > test/result.txt 2>/dev/null
# the harness writes its results into <pre id="test-out">, ending with DONE
awk '/<pre id="test-out">/{on=1; sub(/.*<pre id="test-out">/, "")} on{print} /DONE<\/pre>/{exit}' test/result.txt | sed 's/DONE<\/pre>.*/DONE/' > test/out.txt
if ! grep -q '^DONE' test/out.txt; then echo "harness did not finish"; head -c 300 test/out.txt; exit 1; fi
grep -v '^PASS' test/out.txt
echo "PASS $(grep -c '^PASS' test/out.txt)  FAIL $(grep -c '^FAIL' test/out.txt)"
