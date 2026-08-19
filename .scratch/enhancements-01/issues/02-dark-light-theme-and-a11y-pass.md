# 02 — Dark/Light Theme System & Accessibility (a11y) Pass

**What to build:** Introduce full light and dark mode theming support across all views with persistent preference storage, and execute an accessibility overhaul ensuring all interactive controls are accessible by screen readers and navigable via keyboard shortcuts.

**Blocked by:** None — can start immediately

**Status:** done

- [x] Tailwind configuration enables class-based dark mode (`darkMode: 'class'`).
- [x] Header includes a responsive theme toggle button switching between dark and light themes smoothly.
- [x] Theme preference persists across browser sessions using `localStorage` and respects system preferences by default.
- [x] All UI views (Header, Dropzone, Treemap, Dependency Graph, Architecture, Inspector Sidebar, Modals) render cleanly with WCAG AA compliant contrast ratios in both light and dark modes.
- [x] All interactive buttons, inputs, tabs, and modals have explicit `aria-label`s, appropriate ARIA roles, and keyboard navigation support.
- [x] Analysis progress updates trigger screen reader live announcements.
