#!/usr/bin/env python3
"""Dependency-free production checks for CCA Ocean."""
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
errors=[]
html=(root/"index.html").read_text(encoding="utf-8")
js=(root/"app.js").read_text(encoding="utf-8")
css=(root/"styles.css").read_text(encoding="utf-8")
ids=re.findall(r'\bid="([^"]+)"',html)
dupes=sorted({x for x in ids if ids.count(x)>1})
if dupes: errors.append("Duplicate HTML ids: "+", ".join(dupes))
for target in re.findall(r'href="#([^"]+)"',html):
    if target not in ids: errors.append(f"Missing hash target: #{target}")
for required in ["canonical","og:title","description"]:
    if required not in html: errors.append("Missing metadata: "+required)
manifest=root/"data"/"research-manifest.json"
try:
    data=json.loads(manifest.read_text(encoding="utf-8"))
    if "provenance" not in data or "assets" not in data: errors.append("Research manifest missing provenance/assets")
except Exception as e: errors.append("Invalid research manifest: "+str(e))
if "PAPER METRICS / NO INFERENCE EXPORT" not in js: errors.append("Evidence provenance UI guard missing")
if "prefers-reduced-motion" not in css: errors.append("Reduced-motion CSS missing")
print(f"Checked {len(ids)} ids, research manifest, metadata and accessibility guards.")
if errors:
    print("\n".join("ERROR: "+e for e in errors));sys.exit(1)
print("CCA Ocean production checks passed.")
