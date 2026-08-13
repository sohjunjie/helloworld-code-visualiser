---
name: resume-coding-task
description: Use this skill when a coding task was interrupted mid-execution, and the agent needs to inspect an untracked codebase, assess what has already been built versus what remains, and seamlessly continue execution to fulfill the original requirements.
commands:
  - /resume-coding-task
---

# Input Requirements
* **Parameter:** Exactly one target log file path is required (e.g., `app.log`, `server.txt`).
* **Validation:** If the user does not provide a file path, or if the file does not exist, explicitly ask the user for the correct file path before proceeding.


# Execution Workflow

When this skill is triggered, execute the following steps in sequence before making any code modifications.

## Step 1: Ingest Requirements
1. Read and parse the target markdown file specified by `original_prompt_path`.
2. Extract and internalize:
   - Core functional requirements and targets.
   - Non-functional constraints (tech stack, architectural rules, code style).
   - Expected outputs/deliverables.

## Step 2: Codebase State & File Analysis (No-Git Inspection)
Because the repository is **not** tracked by Git, perform a direct filesystem inspection to construct the baseline state:

1. **Directory Tree Assessment:**
   - Scan directory structures and file trees.
   - Identify newly generated files, temporary files, partially written files, or skeleton files.

2. **File Timestamp & Recency Scanning:**
   - Sort files by modified timestamps (`mtime`) to isolate recently created or modified files.
   - Examine recent log outputs, test run logs, or temp files if present.

3. **Incomplete Code Detection:**
   - Search the codebase for truncation markers, incomplete logic, syntax errors, or pending comments (e.g., `TODO`, `FIXME`, `UNFINISHED`, incomplete function signatures, unhandled branches).
   - Verify if dependencies listed in environment files (`package.json`, `requirements.txt`, `Cargo.toml`, etc.) are actively imported in the code.

## Step 3: Gap Analysis & Progress Audit
Cross-reference the original requirements from Step 1 against the code state discovered in Step 2. Formulate a structured status report covering:

- **Completed Tasks:** Features/components fully implemented and verified in the current files.
- **In-Progress / Partial Tasks:** Files or functions that exist but are truncated, non-functional, or missing integration.
- **Unstarted Tasks:** Requirements from the original prompt with no existing code backing.
- **Broken / Syntactically Invalid Code:** Syntax errors or incomplete code blocks resulting from the abrupt termination.

## Step 4: Generate Execution Plan
Before modifying any code, output a brief markdown plan titled `## Continuation Plan`:

1. **Repair Phase:** Fix syntax errors, truncated files, or dangling references caused by the abrupt stop.
2. **Implementation Roadmap:** Group remaining unstarted and partial tasks into sequential, logical steps.
3. **Validation Strategy:** Define how completed work will be tested (e.g., running tests, executing scripts, checking outputs).

## Step 5: Resume Execution
1. Repair broken code first to bring the codebase back to a stable, runnable state.
2. Execute the steps outlined in the **Continuation Plan** sequentially.
3. Validate each component as it is finished.
4. Conclude only when all objectives in `original_prompt_path` are fully met and verified.

# Instruction Guidelines for the Agent

- **Do NOT re-implement finished code:** Respect existing functional code even if uncommitted; do not wipe out valid progress.
- **Do NOT run `git` commands:** Assume Git is unavailable or uninitialized in this environment. Rely strictly on direct file system reads and file modification metadata.
- **Self-Healing First:** Always fix syntax or syntax-truncation errors before attempting to append new features.