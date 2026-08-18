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

---

## Operational Lessons & Best Practices

- **Always Verify on Disk**: Never conclude a task without executing `list_dir` or `view_file` to verify physical write operations.
- **Fallback to Direct Editing**: If subagents or external tools produce ambiguous results, perform the edit directly in-process.
- **Document New Failure Modes**: When a new environment quirk or tool edge case is identified, append it to this document or project memory notes.