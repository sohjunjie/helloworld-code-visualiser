# 15 — Browser-Local AI Codebase Explanations (WebLLM / Transformers.js)

**What to build:** Integrate an in-browser local AI inference runtime (via WebLLM or Transformers.js) executing inside a dedicated background worker to provide natural language explanations of selected files, structural clusters, and refactoring suggestions without sending any source code or metadata to an external server.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring), 12 — Automated Codebase Improvement Recommendations Panel

**Status:** ready-for-agent

- [ ] Browser-local LLM execution engine initializes inside a Web Worker using WebGPU/Wasm (with graceful fallback if hardware acceleration is unavailable).
- [ ] Inspector sidebar includes an "Explain with AI" action generating succinct summaries of a file's architectural role based on imports, exports, and naming heuristics.
- [ ] Architecture view supports "Explain Cluster" to summarize the domain responsibility of grouped modules.
- [ ] Improvement Recommendations panel offers "AI Refactoring Assistant" detailing concrete code restructuring suggestions.
- [ ] Complete zero-backend privacy guarantee is preserved; no network payloads or prompt contents leave the user's browser.
