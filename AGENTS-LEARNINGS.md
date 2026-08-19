# Agents Learnings

This document records agent self-reflections, post-mortem root causes from past executions, and operational best practices.

---

## Post-Mortem & Self-Reflection

Review of past execution bottlenecks highlights key operational failure modes to avoid:

1. **Premature Assumption of Success (Delegation & State Blindness)**:
   - Assuming file operations or delegated sub-tasks completed successfully based on text feedback alone without empirically inspecting the filesystem state.
   - Relying on indirect agent execution without verifying that changes were written to the target workspace directory.
2. **Over-Indirection for Bounded Work**:
   - Introducing multi-agent orchestration for small, deterministic tasks where direct file edits are faster, safer, and less error-prone.
3. **Unverified Terminal & Script Execution**:
   - Running environment-dependent scripts without accounting for system-level execution policies or shell constraints (e.g., PowerShell script restrictions vs. standard CMD invocation).
4. **PowerShell vs CMD Command Execution Drift**:
   - Invoking global binaries like `npm` or `npx` directly in PowerShell shell environment can trigger `PSSecurityException` due to `npm.ps1` execution policies.
   - Calling `npx graphify update .` may fail binary resolution on Windows where `graphify update .` is globally installed.
5. **Web Worker postMessage in JSDOM / Test Environments**:
   - Calling `postMessage` directly in code imported by Vitest/JSDOM can fail with `TypeError: 'postMessage' requires 2 arguments: 'message' and 'targetOrigin'` because JSDOM defines `window.postMessage`.
   - Always guard worker global messaging with environment checks (`typeof window === 'undefined'`) or allow callback injection (`onProgress`).

---

## Operational Lessons & Best Practices

- **Always Verify on Disk**: Never conclude a task without executing `list_dir` or `view_file` to verify physical write operations.
- **Fallback to Direct Editing**: If subagents or external tools produce ambiguous results, perform the edit directly in-process.
- **Document New Failure Modes**: When a new environment quirk or tool edge case is identified, append it to this document or project memory notes.
- **Windows Terminal Invocation**: On Windows host environments, wrap build/tool commands using `cmd /c "<command>"` (e.g. `cmd /c "npm run build"` and `cmd /c "graphify update ."`) to bypass PowerShell script execution policy restrictions and path resolution issues.
- **Mandatory Pre-Completion Self-Improvement Check**: Before concluding any task, review the execution trajectory for anomalies, update `AGENTS-LEARNINGS.md` with post-mortems and operational lessons, and check off every item on the `AGENTS-EXECUTION-PROTOCOL.md` pre-completion checklist.
- **Anchor Self-Improvement to Build Verification**: Treat self-improvement as a mandatory sub-step of build verification, not a separate phase. Immediately after the build succeeds and graphify syncs, execute the reflection loop *before* composing the user-facing summary. Mental model: "Build passed → reflect → then report."
- **CSS Flex Height Chain**: When debugging flex containers that don't fill available space, check the entire ancestor chain for: (a) `min-h-screen` vs `h-screen` on the root, (b) missing `min-h-0` on flex items, and (c) missing `overflow-hidden` on flex containers. All three must be correct at every level.
- **Interface Extension Checklist**: When adding required fields to a TypeScript interface, immediately search for all construction sites (`grep` for the interface name and for `patterns.push` / object literals) and verify each one provides the new field. Also check test fixtures.
- **Loop Progress Dispatch with Item Filtering**: When reporting incremental progress over filtered entries in a loop, avoid early `continue` that skips the end-of-loop progress check. Ensure progress callbacks are invoked even when the current entry is skipped.
- **Web Worker Isomorphic Testability**: Design Web Worker functions as pure or parameter-driven async routines that accept optional progress callbacks so they can be tested directly in headless unit test runners without requiring mock Worker threads.
- **Theme and DOM Class Synchronization in Headless Environments**: When writing unit tests for store services that synchronize browser preferences (`localStorage`) and document root classes (`document.documentElement.classList`), provide safe guards and mocks so tests execute seamlessly in both JSDOM and pure Node test runners without throwing reference errors.
- **Cross-Cutting Feature Utility Decoupling (Theming & Formatting)**: When implementing cross-cutting concerns like light/dark mode theming, extract state management, localStorage persistence, and visual theme constants (e.g. Treemap depth palettes, Cytoscape graph styles, file extension colors) into a dedicated service (`ThemeService`) and reusable UI utility (`ThemeToggleComponent`). Centralizing formatting and styles prevents code duplication across views and guarantees consistent WCAG AA compliance.
- **Angular DI Dual-Context Instantiation in Unit Tests**: Using field injection (`inject(Service)`) inside services causes direct `new Service()` calls in unit tests to fail with `NG0203` (outside injection context). Support dual-context instantiation by accepting an optional constructor parameter with a fallback (`themeService?: ThemeService; this.themeService = themeService ?? inject(ThemeService, { optional: true }) ?? new ThemeService();`). This allows effortless direct unit testing without requiring mock injector boilerplate while maintaining Angular DI compatibility.
- **WCAG AA Dynamic Theming Contrast**: Ensure every dynamic color palette (e.g. badges, metrics, borders, focus rings) defines paired high-contrast text and background values for both light mode (`text-sky-800 bg-sky-100 border-sky-300`) and dark mode (`dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/30`), maintaining a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text across all theme states.
- **Windows CLI Command Quoting & Chaining**: In Windows PowerShell / CMD environments, avoid nested double quotes in `cmd /c "git commit -m \"...\""` or unsupported `&&` operators. Execute commands in discrete tool calls or format commit messages with clean single-level quotes to avoid command parser pathspec failures.