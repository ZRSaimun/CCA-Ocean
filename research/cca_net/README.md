# CCA-Net implementation scaffold

This is a trainable implementation scaffold based on the architecture described in the supplied paper abstract: underwater colour normalisation (UCN), hierarchical feature extraction, boundary-aware decoding, semantic and boundary outputs, coarse supervision, and CE + Dice + Boundary BCE + Coarse losses.

## Important reproduction note
The abstract names SegFormer MiT-B2, but does not provide every implementation hyperparameter, preprocessing rule, split, class mapping, loss weight, or trained checkpoint. The included portable encoder lets the code run structurally, but it is **not a claim of exact paper reproduction**. The next research step is to replace it with a verified MiT-B2 implementation and train/evaluate using the exact experimental protocol when those details are available.

## What creates a checkpoint?
A checkpoint is produced by training; it cannot be inferred from the paper's reported metrics. Once a genuine trained checkpoint exists, `infer.py` can load it and CCA Ocean's research manifest can expose real prediction artifacts.

## Dataset layout
Prepare CoralScapes according to its official licence/instructions and keep raw dataset files out of this repository unless redistribution is permitted. Training code should consume explicit image/mask paths and preserve the dataset's class IDs.
