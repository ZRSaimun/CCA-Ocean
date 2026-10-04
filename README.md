# https://zrsaimun.github.io/CCA-Ocean

# CCA Ocean

**Planet → Ocean → Reef → Vision**

CCA Ocean is a cinematic WebGL research experience exploring the importance of our oceans, coral reef ecosystems, and AI-powered underwater vision.

The experience moves from a planet-scale view of Earth into the ocean, descends through underwater visual degradation, arrives at a coral reef, and then explains the research direction behind **CCA-Net** through interactive visualisation.

## Research anchor

**A Colour-Constancy and Boundary-Aware Multi-Task Network for Fine-Grained Underwater Coral Reef Semantic Segmentation**

Authors: Md Zillur Rahman Saimon, Pravallika Kondapalli, Sourav Das Polok, Muhammad Aumlanul Abrar.

The supplied abstract describes CCA-Net as combining:

- Underwater Colour Normalization (UCN)
- SegFormer MiT-B2 backbone
- Boundary-Aware Refinement (BAR) decoder
- Hierarchical coarse segmentation supervision
- Composite Cross-Entropy, Dice, Boundary BCE and Coarse Segmentation losses

Reported CoralScapes results in the abstract: **82.80% accuracy** and **58.0% mIoU**.

The site treats these research elements carefully: interactive graphics are explanatory visualisations, not claims of live model inference.

## Experience

- Real-time Three.js/WebGL scene
- Cinematic rotating Earth and orbital introduction
- Ocean-surface transition and simulated underwater descent
- Procedural coral reef environment
- Underwater particles and depth atmosphere
- Interactive colour-normalisation comparison
- Stylised semantic segmentation overlay
- CCA-Net research pipeline visualisation
- Responsive design and reduced-motion support
- Optional ambient audio; no autoplay

## Run locally

This first release is intentionally build-free. Serve the repository with any static HTTP server and open `index.html`.

## GitHub Pages

The site is designed to deploy directly from the repository root on the `main` branch through GitHub Pages.

---

CCA Ocean is a visual research project about **observation and understanding**. It does not claim that computer vision directly stops bleaching, pollution or climate change; it explores how better underwater image interpretation can support reef monitoring and analysis.


## Advanced experience architecture

The current experience combines:

- GPU shader-driven ocean waves with view-dependent Fresnel colour
- animated caustics, volumetric light shafts, marine snow and directional currents
- adaptive Cinematic / Balanced / Efficient rendering quality
- state-aware surface-to-underwater fog, exposure, post-processing and opt-in audio
- HDR-style bloom post-processing through Three.js EffectComposer
- multi-form procedural reef biome with branching, massive and plate coral forms, rocks and irregular seabed relief
- schooling marine-life silhouettes for parallax and scale
- spatial CCA-Net research visualisation inside the 3D reef
- a five-stage explanatory Research Dive: underwater degradation → UCN → SegFormer MiT-B2 → BAR → semantic segmentation
- NASA Earth imagery with atmosphere, cloud shell, directional sunlight and planetary halo

### Scientific integrity

CCA Ocean is an explanatory research experience. The spatial scanner, feature grid, boundary markers and semantic overlays are visual explanations and are **not live neural-network inference**. Reported CCA-Net metrics and architecture claims are limited to the supplied research abstract. External dataset information is labelled separately.

### Performance

The renderer monitors frame rate in Auto mode and can reduce pixel ratio and expensive volumetric/particle layers. Visitors can also cycle rendering quality manually. Reduced-motion and mobile-specific presentation rules are included.
