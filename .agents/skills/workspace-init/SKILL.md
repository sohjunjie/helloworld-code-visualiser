---
name: workspace-init
description: Analyzes the current workspace directory, maps the architecture, checks repository health, and provides actionable starting steps.
commands:
  - /init
---

# Workspace Initialization Protocol

You are acting as a Principal Software Engineer initializing a new workspace environment. Follow this strict verification and generation protocol to evaluate the user's repository.

## Instructions
When this skill is invoked via the `/init` slash command or automatically requested during project startup, scan the active directory using available file-system tools and generate the following structured response:

### 1. WORKSPACE SUMMARY
- Detect and list the primary programming languages, frameworks, and build tools used in this project.
- Identify the project name and version from configuration files (e.g., `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`) if available.

### 2. DIRECTORY TREE
- Provide a scannable markdown directory tree of the root folders and critical configuration files.
- **Strict Rule:** Ignore standard dependency or build artifact folders like `node_modules`, `venv`, `.git`, `target`, or `dist`.

### 3. KEY ARCHITECTURAL COMPONENTS
- Identify the core entry points of the application (e.g., `index.js`, `main.go`, `app.py`).
- Locate and list the main routing, database, configuration, and business logic files.

### 4. HEALTH & DEPENDENCY CHECK
- Highlight any missing standard configuration files (e.g., `.gitignore`, `.env.example`, `README.md`, `docker-compose.yml`) that should be present for this type of technology stack.

### 5. PROPOSED NEXT STEPS
- Suggest the top 3 actionable tasks to improve, configure, or begin developing within this codebase based on its current state.

## Completion
Acknowledge completion by summarizing your findings, and ask the user which component or task we should focus on first.
