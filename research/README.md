# CCA Ocean research engine

This folder is the bridge between reproducible research outputs and the cinematic website.

## Input contract

Place genuine experiment exports in `research/input/` using optional folders:
`raw/`, `ground_truth/`, `normalised/`, `boundaries/`, `predictions/`, and `failures/`.

If available, add `research/input/metrics.json` containing metrics exported from the actual experiment. Run:

```bash
python research/build_manifest.py
```

The script writes `data/research-manifest.json`. It does **not** perform CCA-Net inference and does not synthesise missing metrics. Until trained weights and genuine experiment outputs are supplied, the website must label model-like graphics as explanatory/simulated.

The paper abstract currently supports the headline reported values 82.80% accuracy and 58.0% mIoU. Per-class IoU, confusion matrices, model predictions and failure examples must come from real experiment artifacts before they are presented as results.
