# Graph Report - helloworld-code-visualiser  (2026-08-21)

## Corpus Check
- 69 files · ~141,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 392 nodes · 638 edges · 38 communities (19 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2599ba4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.service.ts
- dependencies
- devDependencies
- ThemeService
- development
- compilerOptions
- code-visualizer.models.ts
- VisualizerStoreService
- 01-worker-modularization-and-core-testing.md
- App Root Template
- CodeFileNode
- 02-dark-light-theme-and-a11y-pass.md
- tsconfig.app.json
- tsconfig.spec.json
- DependencyGraphViewComponent
- helloworld-code-visualiser
- 03-svg-diagram-export-and-advanced-graph-filtering.md
- 04-polyglot-multilanguage-import-extraction.md
- app.config.ts
- 05-code-complexity-metrics-and-health-heatmap.md
- 06-directory-level-dependency-aggregation-and-drill-down.md
- 07-shareable-analysis-state-url-and-hwcv-export.md
- pnpm Workspace Allow Builds Configuration
- 08-architecture-rule-validation-and-compliance-dashboard.md
- 09-git-history-churn-analysis-and-risk-hotspots.md
- 10-visual-two-version-codebase-diffing.md
- 11-realtime-local-folder-watching.md
- 12-automated-codebase-improvement-recommendations.md
- 13-interactive-annotated-code-tours.md
- 14-client-side-plugin-and-parser-extension-architecture.md
- 15-browser-local-ai-codebase-explanations.md
- 16-3d-immersive-architecture-visualizer.md
- HeaderComponent
- ast-parser.ts

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 37 edges
2. `ThemeService` - 31 edges
3. `DependencyGraphViewComponent` - 20 edges
4. `CodeFileNode` - 19 edges
5. `TreemapViewComponent` - 18 edges
6. `buildAndParseGraph()` - 14 edges
7. `ExportDemoService` - 13 edges
8. `HeaderComponent` - 11 edges
9. `compilerOptions` - 11 edges
10. `parseFileContents()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `VisualizerStoreService` --references--> `ThemeService`  [EXTRACTED]
  src/app/services/visualizer-store.service.ts → src/app/services/theme.service.ts
- `buildAndParseGraph()` --calls--> `parseFileContents()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/ast-parser.ts
- `TreemapViewComponent` --references--> `CodeFileNode`  [EXTRACTED]
  src/app/components/treemap-view/treemap-view.component.ts → src/app/models/code-visualizer.models.ts
- `ParsedAstResult` --references--> `AstSummary`  [EXTRACTED]
  src/app/workers/ast-parser.ts → src/app/models/code-visualizer.models.ts
- `processZipFile()` --calls--> `extractZipEntries()`  [EXTRACTED]
  src/app/workers/analysis.worker.ts → src/app/workers/zip-extractor.ts

## Import Cycles
- None detected.

## Communities (38 total, 19 thin omitted)

### Community 0 - "theme.service.ts"
Cohesion: 0.14
Nodes (10): ThemeToggleComponent, Component, AnalysisResult, ExportDemoService, Injectable, GraphThemeConfig, NodeColorConfig, escapeXml() (+2 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (31): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+23 more)

### Community 4 - "development"
Cohesion: 0.08
Nodes (26): build, serve, test, builder, configurations, defaultConfiguration, options, development (+18 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "code-visualizer.models.ts"
Cohesion: 0.11
Nodes (30): AnalysisStats, CodeHealthSummary, FileNodeType, GraphEdge, HighComplexityFile, PatternGrouping, StructuralHotspot, UploadProgress (+22 more)

### Community 7 - "VisualizerStoreService"
Cohesion: 0.07
Nodes (16): App, Component, ArchitectureViewComponent, Component, InspectorSidebarComponent, Component, ProgressModalComponent, Component (+8 more)

### Community 9 - "App Root Template"
Cohesion: 0.67
Nodes (3): App Root Template, App View Switcher (@switch activeTab), HTML Entry Document

### Community 10 - "CodeFileNode"
Cohesion: 0.24
Nodes (4): TreemapViewComponent, Component, ViewChild, CodeFileNode

### Community 12 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): src/test-setup.ts, src/**/*.ts, compilerOptions, types, exclude, extends, include, src/**/*.spec.ts (+1 more)

### Community 13 - "tsconfig.spec.json"
Cohesion: 0.22
Nodes (8): src/**/*.d.ts, vitest/globals, compilerOptions, types, extends, include, src/**/*.spec.ts, ./tsconfig.json

### Community 14 - "DependencyGraphViewComponent"
Cohesion: 0.14
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 15 - "helloworld-code-visualiser"
Cohesion: 0.15
Nodes (12): packageManager, prefix, projectType, root, schematics, sourceRoot, cli, newProjectRoot (+4 more)

### Community 36 - "HeaderComponent"
Cohesion: 0.27
Nodes (3): HostListener, HeaderComponent, Component

### Community 37 - "ast-parser.ts"
Cohesion: 0.33
Nodes (10): AstSummary, ComplexityMetrics, calculateMaintainabilityIndex(), countLineMetrics(), estimateComplexityFromText(), JS_TS_EXTENSIONS, ParsedAstResult, parseFileContents() (+2 more)

## Knowledge Gaps
- **112 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualizerStoreService` connect `VisualizerStoreService` to `theme.service.ts`, `CodeFileNode`, `ThemeService`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `DependencyGraphViewComponent` connect `DependencyGraphViewComponent` to `theme.service.ts`, `VisualizerStoreService`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ThemeService` connect `ThemeService` to `theme.service.ts`, `VisualizerStoreService`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._