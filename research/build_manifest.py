"""CCA Ocean research asset builder.

Creates web-ready manifest data from *real* experiment exports when available.
It never invents predictions or metrics. Put experiment files under research/input/.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INPUT=ROOT/"research"/"input"
OUTPUT=ROOT/"data"/"research-manifest.json"
ALLOWED={".png",".jpg",".jpeg",".webp"}

def find_assets(folder: Path):
    if not folder.exists(): return []
    return [str(p.relative_to(ROOT)).replace("\\","/") for p in sorted(folder.rglob("*")) if p.suffix.lower() in ALLOWED]

def load_metrics():
    p=INPUT/"metrics.json"
    if not p.exists():
        return {"status":"paper-reported-only","accuracy":82.80,"miou":58.0,
                "note":"Headline values are reported in the supplied paper abstract; no per-class experiment export is bundled."}
    return {"status":"experiment-export","values":json.loads(p.read_text(encoding="utf-8"))}

def build():
    manifest={
      "provenance":{"generated_by":"research/build_manifest.py","inference":"not-run-by-this-script",
                    "rule":"Only files physically present in research/input are exposed as real experiment assets."},
      "metrics":load_metrics(),
      "assets":{"raw":find_assets(INPUT/"raw"),"ground_truth":find_assets(INPUT/"ground_truth"),
                "normalised":find_assets(INPUT/"normalised"),"boundaries":find_assets(INPUT/"boundaries"),
                "predictions":find_assets(INPUT/"predictions"),"failures":find_assets(INPUT/"failures")}
    }
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(manifest,indent=2),encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")

if __name__=="__main__": build()
