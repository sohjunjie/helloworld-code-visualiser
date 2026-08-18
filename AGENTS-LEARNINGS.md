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
5. **Premature Task Finalization Skipping Self-Improvement Protocol**:
   - Marking a task as complete without executing the mandatory self-improvement reflection loop defined in `AGENTS-IMPROVEMENTS-PROTOCOL.md`.
   - Failing to document environment quirks (such as shell execution policy errors) in `AGENTS-LEARNINGS.md` prior to reporting completion.

---

## Operational Lessons & Best Practices

- **Always Verify on Disk**: Never conclude a task without executing `list_dir` or `view_file` to verify physical write operations.
- **Fallback to Direct Editing**: If subagents or external tools produce ambiguous results, perform the edit directly in-process.
- **Document New Failure Modes**: When a new environment quirk or tool edge case is identified, append it to this document or project memory notes.
- **Windows Terminal Invocation**: On Windows host environments, wrap build/tool commands using `cmd /c "<command>"` (e.g. `cmd /c "npm run build"` and `cmd /c "graphify update ."`) to bypass PowerShell script execution policy restrictions and path resolution issues.
- **Mandatory Pre-Completion Self-Improvement Check**: Before concluding any task, review the execution trajectory for anomalies, update `AGENTS-LEARNINGS.md` with post-mortems and operational lessons, and check off every item on the `AGENTS-EXECUTION-PROTOCOL.md` pre-completion checklist.