# 14 — Client-Side Plugin & Custom Parser Extension Architecture

**What to build:** Design and implement an extensible `CodeVisualizerPlugin` architecture enabling developers to load custom language parsers, custom AST analyzers, and custom visualization tabs dynamically from external JSON manifests without requiring modifications to the application core.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 04 — Polyglot Multi-Language Import Extraction

**Status:** ready-for-agent

- [ ] Core pipeline defines a typed `CodeVisualizerPlugin` interface for custom file extensions, AST visitors, and dependency extractors.
- [ ] Built-in language extractors (JS/TS, Python, Java, Go, etc.) are refactored into internal pluggable modules complying with the plugin interface.
- [ ] Plugin settings dialog allows users to register external plugin URLs or JSON descriptors at runtime.
- [ ] Plugin lifecycle handles dynamic registration, execution sandboxing, and error isolation without destabilizing the main application.
