# Agents execution protocol

This protocol defines standard operational requirements, execution steps, and workspace verification procedures for all codebase modifications, feature implementations, refactoring tasks, bug fixes, and knowledge-graph synchronization.

---

## 1. Graphify Protocol & Context Discovery

Before modifying code or analyzing project architecture, agents **MUST** leverage Graphify outputs to understand the project structure, dependencies, and code maps (if available).

> **Note on Graceful Fallback / Conditional Skip:** If the `graphify-out/` directory or artifacts (`GRAPH_REPORT.md`) do not exist or have not been created yet in the workspace, agents **MAY SKIP** Graphify-specific checks and updates, proceeding with standard codebase inspection tools (`view_file`, `grep_search`, `list_dir`).

### Graphify Reference Files
- **Graph Report:** `graphify-out/GRAPH_REPORT.md` (Read this first for a summary of modules, classes, and functions).
- **Graph Visualisation Map:** `graphify-out/graph.html` (Reference to trace complex structural edges or dependency flows).
- **Graph Raw Data:** `graphify-out/graph.json` (Use for programmatically parsing structural relationships).

### Graphify Operational Rules
1. **Mandatory Context Checks**:
   - **Onboard & Start New Task:** Read `graphify-out/GRAPH_REPORT.md` to find the exact files, functions, and entry points relevant to the request. Do not read the entire codebase manually. (Skip if `graphify-out/` is missing).
   - **Assess Impact:** Check dependencies listed in the Graphify report to determine which modules may be affected when modifying specific classes or functions.
2. **Maintenance & Incremental Updates**:
   - Whenever files are created, modified, or deleted, the local knowledge graph becomes stale.
   - **Action Required:** Immediately after modifying or writing code files, run `graphify update .` to synchronize the graph (skip if Graphify is not initialized in the project).
   - **Verification:** Confirm `graphify-out/GRAPH_REPORT.md` has updated before completing the task.
3. **Exclusions & Routing**:
   - Ignore files/directories listed in `.graphifyignore`. Do not attempt to index raw agent skills or runtime tool directories.

---

## 2. Universal Execution Protocol

All files modifications must strictly adhere to the following sequence:

### Phase 1: Mandatory Best Practices Consultation & Context Discovery (Graphify-First)
- **Consult Coding Best Practices & Past Learnings**: **MANDATORY**: Before formulating a plan, designing architecture, or modifying code for ANY task, open and read [`AGENTS-LEARNINGS.md`](./AGENTS-LEARNINGS.md) and [`AGENTS-IMPROVEMENTS-PROTOCOL.md`](./AGENTS-IMPROVEMENTS-PROTOCOL.md). Review all documented operational principles, architecture/UI guidelines, and TypeScript/testing best practices (e.g. cross-cutting utility decoupling, WCAG AA dynamic contrast, and Windows CLI execution). Actively apply these best practices to the current task to prevent recurring defects.
- **Graphify Discovery**: Read `graphify-out/GRAPH_REPORT.md` to map out dependencies, affected modules, and symbols before making edits (if `graphify-out` exists).

### Phase 2: Execution & Verification
- **Direct Workspace File Operations**: Perform code changes, file creations, and structural updates directly in the workspace, applying the consulted best practices.
- **Empirical State Verification**: Immediately inspect directory contents (`list_dir`) and modified file structures (`view_file`) after writing changes to guarantee file existence, correct paths, and accurate byte sizes.

### Phase 3: Graphify Synchronization & Build Verification
- **Synchronize Knowledge Graph**: Run `graphify update .` whenever code files have been edited, added, or deleted (skip if `graphify-out` is not initialized).
- **Run Verification Suite**: Execute project build scripts, type checks, or test suites (e.g., via `cmd /c "<build-command>"` on Windows) to confirm zero compilation errors.
- **Enforce Zero-Regression Guarantee**: Ensure existing API contracts, exports, and module dependencies remain unbroken.

### Phase 4: Self-Improvement & Continuous Learning
- **Conduct Continuous Self-Improvement**: Follow the continuous improvement feedback loop in [`AGENTS-IMPROVEMENTS-PROTOCOL.md`](./AGENTS-IMPROVEMENTS-PROTOCOL.md). Apply the Generalizability Filter (pruning one-offs/micro-rules) and route any newly identified generic best practices or operational principles into the proper section of [`AGENTS-LEARNINGS.md`](./AGENTS-LEARNINGS.md).

---

## 3. Pre-Completion Checklist

Before marking any task as complete, verify:

- [ ] **Pre-Task Best Practices Consultation**: [`AGENTS-LEARNINGS.md`](./AGENTS-LEARNINGS.md) and [`AGENTS-IMPROVEMENTS-PROTOCOL.md`](./AGENTS-IMPROVEMENTS-PROTOCOL.md) were read and all relevant coding best practices were applied to the implementation.
- [ ] **Graphify Discovery**: `graphify-out/GRAPH_REPORT.md` was referenced for context discovery and dependency impact analysis (n/a if `graphify-out` not initialized).
- [ ] **State Discovery**: All created or modified files exist on disk with valid non-zero content.
- [ ] **Clean Syntax & Imports**: No broken imports, syntax errors, or unhandled file path resolution issues exist.
- [ ] **Graphify Sync**: `graphify update .` was executed following file changes, and `graphify-out/GRAPH_REPORT.md` is up to date (n/a if `graphify-out` not initialized).
- [ ] **Build Verification**: Project build/test suite executes cleanly (Exit Code 0).
- [ ] **Self-Improvement Review**: Continuous improvement feedback loop in [`AGENTS-IMPROVEMENTS-PROTOCOL.md`](./AGENTS-IMPROVEMENTS-PROTOCOL.md) was executed, applying the generalizability filter and properly categorizing any new lessons in [`AGENTS-LEARNINGS.md`](./AGENTS-LEARNINGS.md).