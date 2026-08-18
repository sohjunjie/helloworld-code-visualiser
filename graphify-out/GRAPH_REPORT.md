# Graph Report - helloworld-code-visualiser  (2026-08-18)

## Corpus Check
- 49 files · ~19,798 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 345 nodes · 428 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `728ce5c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VisualizerStoreService
- dependencies
- devDependencies
- Setup Matt Pocock Skills
- development
- compilerOptions
- analysis.worker.ts
- To Tickets Skill
- Writing for Agents Skill
- CodeVisualizer Web Application Specification
- helloworld-code-visualiser
- TDD Skill
- tsconfig.app.json
- tsconfig.spec.json
- DependencyGraphViewComponent
- TreemapViewComponent
- Grilling Skill
- UploadDropzoneComponent
- app.config.ts
- InspectorSidebarComponent
- Agents Protocol
- Angular CLI Development and Build Guide
- pnpm Workspace Allow Builds Configuration
- Agent Core Instructions

## God Nodes (most connected - your core abstractions)
1. `VisualizerStoreService` - 23 edges
2. `TreemapViewComponent` - 13 edges
3. `buildAndParseGraph()` - 11 edges
4. `compilerOptions` - 11 edges
5. `DependencyGraphViewComponent` - 10 edges
6. `CodeFileNode` - 10 edges
7. `ExportDemoService` - 9 edges
8. `Setup Matt Pocock Skills` - 9 edges
9. `Writing for Agents Skill` - 8 edges
10. `helloworld-code-visualiser` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Problem Statement and Client-Side Solution` --semantically_similar_to--> `Core Objective and Codebase Visualization Goals`  [INFERRED] [semantically similar]
  SPEC.md → IMPLEMENTATION-PLAN.md
- `App View Switcher (@switch activeTab)` --implements--> `Workspace Views (D3 Treemap and Cytoscape Network)`  [INFERRED]
  src/app/app.html → IMPLEMENTATION-PLAN.md
- `App View Switcher (@switch activeTab)` --implements--> `Implementation Decisions and Modular Architecture`  [INFERRED]
  src/app/app.html → SPEC.md
- `Data Model Shapes (CodeFileNode, GraphEdge, AnalysisResult)` --conceptually_related_to--> `Worker Parsing and Offloading Execution Pipeline`  [INFERRED]
  SPEC.md → IMPLEMENTATION-PLAN.md
- `Implementation Decisions and Modular Architecture` --rationale_for--> `Tech Stack and Architecture Requirements`  [INFERRED]
  SPEC.md → IMPLEMENTATION-PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CodeVisualizer Specification Suite** — spec_doc, implementation_plan_doc, src_app_app_template [INFERRED 0.95]
- **Issue Tracker Provider Backends** — _agents_skills_setup_matt_pocock_skills_issue_tracker_github_github_issue_operations, _agents_skills_setup_matt_pocock_skills_issue_tracker_gitlab_gitlab_issue_operations, _agents_skills_setup_matt_pocock_skills_issue_tracker_local_local_markdown_tracker [INFERRED 0.95]
- **Spec-Driven Development Workflow Pipeline** — _agents_skills_to_spec_skill_to_spec_skill, _agents_skills_implement_skill_implement_skill, _agents_skills_tdd_skill_tdd_skill, _agents_skills_code_review_skill_code_review_skill [INFERRED 0.95]
- **Test-Driven Development Framework & Guidelines** — _agents_skills_tdd_skill_tdd_skill, _agents_skills_tdd_tests_integration_style_tests, _agents_skills_tdd_mocking_system_boundary_mocking [INFERRED 0.95]
- **Writing for Agents Core Principles** — _agents_skills_writing_for_agents_skill_two_loads, _agents_skills_writing_for_agents_skill_information_hierarchy, _agents_skills_writing_for_agents_skill_completion_criteria, _agents_skills_writing_for_agents_skill_leading_words, _agents_skills_writing_for_agents_skill_pruning_principles [INFERRED 0.95]

## Communities (29 total, 5 thin omitted)

### Community 0 - "VisualizerStoreService"
Cohesion: 0.09
Nodes (18): App, Component, ArchitectureViewComponent, Component, HeaderComponent, Component, ProgressModalComponent, Component (+10 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @babel/parser, cytoscape (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (30): @angular/build, @angular/compiler-cli, autoprefixer, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+22 more)

### Community 3 - "Setup Matt Pocock Skills"
Cohesion: 0.08
Nodes (28): Code Review OpenAI Agent Interface, Code Review Skill, Fowler Code Smell Baseline, Two-Axis Review Architecture, Implement OpenAI Agent Interface, Implement Skill, Setup Matt Pocock Skills OpenAI Agent Interface, ADR Conflict Flagging Rule (+20 more)

### Community 4 - "development"
Cohesion: 0.08
Nodes (26): build, serve, test, builder, configurations, defaultConfiguration, options, development (+18 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, compileOnSave, compilerOptions, experimentalDecorators, importHelpers (+10 more)

### Community 6 - "analysis.worker.ts"
Cohesion: 0.22
Nodes (16): GraphEdge, buildAndParseGraph(), buildDirectoryTree(), countDirectories(), findCircularDependencies(), getBasename(), getDirname(), getFileExtension() (+8 more)

### Community 7 - "To Tickets Skill"
Cohesion: 0.25
Nodes (8): To Tickets OpenAI Skill Interface, Blocking Edges Concept, Issue Tracker Ticket Template, Local Ticket Template, To Tickets Skill, Tracer Bullet Tickets, Vertical Slice Rules, Wide Refactors (Expand-Contract)

### Community 8 - "Writing for Agents Skill"
Cohesion: 0.18
Nodes (11): Writing for Agents OpenAI Skill Interface, Steps, Completion Criteria and Legwork, Context Pointers and Trigger Branches, Information Hierarchy and Progressive Disclosure, Leading Words and Positive Framing, Skill Mechanics Specification, Model-Invoked vs User-Invoked Skills, Router Skills Pattern (+3 more)

### Community 9 - "CodeVisualizer Web Application Specification"
Cohesion: 0.17
Nodes (15): Implementation Plan, Core Objective and Codebase Visualization Goals, Worker Parsing and Offloading Execution Pipeline, Tech Stack and Architecture Requirements, Workspace Views (D3 Treemap and Cytoscape Network), Implementation Decisions and Modular Architecture, Data Model Shapes (CodeFileNode, GraphEdge, AnalysisResult), CodeVisualizer Web Application Specification (+7 more)

### Community 10 - "helloworld-code-visualiser"
Cohesion: 0.15
Nodes (12): packageManager, prefix, projectType, root, schematics, sourceRoot, cli, newProjectRoot (+4 more)

### Community 11 - "TDD Skill"
Cohesion: 0.24
Nodes (11): TDD OpenAI Agent Interface, Design for Mockability Patterns, Mocking Guidelines Reference, System Boundary Mocking Rules, TDD Red-Green Loop Rules, TDD Skill, Testing Anti-Patterns Classification, Implementation-Detail Coupled Tests Anti-Pattern (+3 more)

### Community 12 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): src/test-setup.ts, src/**/*.ts, compilerOptions, types, exclude, extends, include, src/**/*.spec.ts (+1 more)

### Community 13 - "tsconfig.spec.json"
Cohesion: 0.22
Nodes (8): src/**/*.d.ts, vitest/globals, compilerOptions, types, extends, include, src/**/*.spec.ts, ./tsconfig.json

### Community 14 - "DependencyGraphViewComponent"
Cohesion: 0.28
Nodes (3): DependencyGraphViewComponent, Component, ViewChild

### Community 15 - "TreemapViewComponent"
Cohesion: 0.29
Nodes (3): TreemapViewComponent, Component, ViewChild

### Community 16 - "Grilling Skill"
Cohesion: 0.33
Nodes (6): Grill-Me OpenAI Agent Interface, Grill-Me Skill, Grilling OpenAI Agent Interface, Design Tree Exploration Model, Frontier Questions Pattern, Grilling Skill

### Community 20 - "Agents Protocol"
Cohesion: 0.22
Nodes (8): 1. Post-Mortem & Reflection (Root Causes), 2. Universal Execution Protocol, 3. Self-Improvement Framework, 4. Pre-Completion Checklist, Agents Protocol, Phase 1: Context & Risk Assessment, Phase 2: Execution & Verification, Phase 3: Build & Contract Verification

### Community 28 - "Agent Core Instructions"
Cohesion: 0.50
Nodes (3): Agent Core Instructions, Critical Compliance Rule, Protocol Verification Block

## Knowledge Gaps
- **131 isolated node(s):** `$schema`, `version`, `packageManager`, `newProjectRoot`, `projectType` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VisualizerStoreService` be split into smaller, more focused modules?**
  _Cohesion score 0.0851063829787234 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Setup Matt Pocock Skills` be split into smaller, more focused modules?**
  _Cohesion score 0.08465608465608465 - nodes in this community are weakly interconnected._
- **Should `development` be split into smaller, more focused modules?**
  _Cohesion score 0.08307692307692308 - nodes in this community are weakly interconnected._