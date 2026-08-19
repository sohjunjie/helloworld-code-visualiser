# 07 — Shareable Zero-Backend Analysis State (URL & `.hwcv` Export)

**What to build:** Provide lightweight, zero-backend state sharing by enabling users to generate compressed, base64-encoded URL fragments (`#data=...`) for small-to-medium repositories, and export/import standalone `.hwcv` bundle files for large codebases without transmitting repository source code to any external server.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**Status:** ready-for-agent

- [ ] "Share Analysis" action in the header generates a compressed URL hash (`#data=...`) containing parsed graph topology, metrics, and metadata.
- [ ] Loading the app with a valid `#data=...` hash restores the full visualization state (active tab, graph layout, selected metrics) immediately without prompting for file upload.
- [ ] "Export Analysis File" downloads a compact `.hwcv` JSON archive containing full parsed metadata and structural graph representation.
- [ ] Dropzone and header support dragging and dropping `.hwcv` files to instantly load pre-computed visualizations.
- [ ] All serialization and parsing occurs entirely client-side, preserving complete user privacy.
