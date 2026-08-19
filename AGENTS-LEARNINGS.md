# Agents Learnings

This document records agent self-reflections, post-mortem root causes from past executions, and generic software engineering / operational best practices.

---

## 1. Post-Mortem & Agent Operational Principles

- **Empirical State Verification**: Never assume file writes or delegated actions succeeded based on textual tool feedback alone. Always inspect the filesystem (`list_dir`, `view_file`) to verify physical file existence, paths, and contents.
- **Direct Execution Over Over-Indirection**: Avoid complex multi-agent orchestration for small, deterministic, bounded tasks where direct in-process file edits are faster, safer, and less error-prone.
- **Windows CLI Execution & Quoting**: On Windows host environments, wrap build/tool commands in `cmd /c "<command>"` to avoid PowerShell script execution policy restrictions (`PSSecurityException`). Avoid nested double quotes or unsupported `&&` operators in chained commands.

---

## 2. Architecture, Styling & UI Best Practices

- **Decoupling Cross-Cutting Concerns**: Isolate cross-cutting state (theming, persistence, formatting) into dedicated singleton services and reusable UI primitives. Centralizing state and styles eliminates duplication across views and ensures consistent behavior.
- **WCAG AA Dynamic Theming Contrast**: Ensure dynamic color palettes (badges, metrics, borders, focus rings) define paired high-contrast text and background tokens for both light mode and dark mode, maintaining a minimum contrast ratio of 4.5:1 for body text and 3:1 for large text across all theme states.
- **CSS Flex Container Height Chains**: When debugging flex containers that fail to fill available space, check the entire ancestor chain: (a) explicit height (`min-h-screen` / `h-screen`) on root, (b) `min-h-0` on flex items to permit shrinking, and (c) `overflow-hidden` on scroll containers.
- **Continuous Hover Hitboxes (Dead Zone Prevention)**: When triggering dropdown menus via hover (`group-hover`), avoid margin gaps (`mt-*`) between the trigger and menu that create pointer-event dead zones. Position dropdowns adjacent (`top-full`) and apply spacing via internal padding or pseudo-element bridges (`before:absolute`).
- **Adaptive Responsive Layouts for High Zoom & Density**: Prevent clipping in dense toolbars/headers under high browser zoom (125%–200%+) via progressive text disclosure (`hidden sm:inline`), explicit flex tolerance (`min-w-0`, `flex-shrink`), horizontal scrolling with hidden scrollbars (`overflow-x-auto`), and viewport-capped overlays (`max-w-[calc(100vw-1.5rem)]`).

---

## 3. TypeScript, Testing & Algorithm Best Practices

- **TypeScript Interface Extension Checklist**: When adding required properties to a TypeScript interface, systematically audit all construction sites, object literals, factory functions, and test fixtures to ensure complete instantiation.
- **Angular DI Dual-Context Instantiation for Unit Testing**: Field injection (`inject(Service)`) causes direct `new Service()` calls in unit tests to fail with `NG0203`. Support dual-context instantiation by accepting an optional constructor parameter with a fallback (`constructor(themeService?: ThemeService) { this.themeService = themeService ?? inject(ThemeService, { optional: true }) ?? new ThemeService(); }`), allowing direct unit testing without injector boilerplate.
- **Resilient Isomorphic Testing for Browser APIs**: Guard browser-only globals (`localStorage`, `document.documentElement`, `window`) when running unit tests across mixed Node/JSDOM environments to prevent uncaught reference errors.
- **Loop Progress Dispatch with Item Filtering**: When reporting incremental progress over filtered entries in a loop, ensure progress callbacks fire regardless of item exclusion, avoiding skipped callbacks from early `continue` statements.