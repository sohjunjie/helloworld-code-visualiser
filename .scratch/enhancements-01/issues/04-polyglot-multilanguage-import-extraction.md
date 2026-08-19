# 04 — Polyglot Multi-Language Import Extraction

**What to build:** Transform the application into a genuine polyglot codebase visualizer by implementing specialized import-extraction algorithms and regex patterns for Python, Java, Go, C#, Rust, Ruby, and PHP file types, correctly resolving language-specific module import conventions.

**Blocked by:** 01 — Worker Modularization & Core Algorithm Testing (Prefactoring)

**Status:** ready-for-agent

- [ ] Python import patterns (`import X`, `from X import Y`, relative imports `.`, `..`) are accurately extracted into graph edges.
- [ ] Java package imports (`import com.example.package.Class;`, wildcard imports) are resolved.
- [ ] Go import declarations (`import "fmt"`, grouped `import (...)`) are supported.
- [ ] C# `using` directives (`using Namespace;`, `using Alias = Namespace.Class;`) are parsed.
- [ ] Rust module declarations (`use std::path;`, `mod sub_module;`, `crate::*`) are parsed.
- [ ] Ruby (`require`, `require_relative`) and PHP (`use`, `require_once`) imports are supported.
- [ ] Automated test fixtures verify correct dependency graph generation for multi-language and polyglot sample repositories.
