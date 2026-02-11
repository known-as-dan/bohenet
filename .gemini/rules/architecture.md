# Architecture Principles

## Core Constraints

- **No backend** — purely client-side SPA. All data lives in `localStorage`. No fetch calls except loading the Excel template from `/static`.
- **Single-page wizard** — no SvelteKit routing beyond the root page. Navigation is managed with `$state` in `+page.svelte`. Dashboard and step components are switched via conditional rendering.
- **Excel template is source of truth** — the official Hebrew inspection template (`static/template.xlsx`) defines all field names, sheet structures, and checklist descriptions. Config files (`config/checklist.ts`, `config/ac.ts`) must mirror it exactly.

## State Management

- **Store factory pattern** — `createInspectionStore(report)` returns a plain object with `$state`/`$derived` getters and methods. One store per open report.
- **Mutations save immediately** — every mutation method calls `save()` which persists the full report to `localStorage`. No debouncing, no batching.
- **Runes everywhere** — use `$state`, `$derived`, `$effect`, `$props` exclusively. Never import from `svelte/store`, never use `$:` reactive statements or `let` exports.

## Component Design

- **Props via `$props()`** — every step component receives `{ store }` typed as `ReturnType<typeof createInspectionStore>`.
- **Flat component tree** — avoid deep nesting. Each of the 7 step components is self-contained. Extract sub-components only when a section exceeds ~150 lines or is reused.
- **No component libraries** — all UI is hand-built with Tailwind utilities. No shadcn, no headless-ui, no external component packages.

## Data Model

- **Types in `models/`** — all TypeScript interfaces live in `src/lib/models/`. Keep them flat and serializable (must survive `JSON.parse(JSON.stringify())`).
- **Config in `config/`** — static template definitions (checklist items, AC measurement templates) are readonly arrays. Never mutate config at runtime.
- **Dynamic regeneration** — DC measurements and string serial lists regenerate when inverter config changes. The store handles this automatically.

## File Organization

- `.svelte.ts` for any `.ts` file that uses runes (`$state`, `$derived`, `$effect`).
- Plain `.ts` for pure functions, types, and constants.
- One model file per domain concept, one config file per Excel sheet section.

## Excel Export

- Use **ExcelJS** to load and fill `template.xlsx`. Only write to existing cells — never add rows/columns/sheets programmatically.
- Use `bakeTableStripes()` to preserve alternating row colors (ExcelJS table formatting workaround).
- Map store data to cells in `src/lib/mappers/`. Each mapper function targets one sheet or section.
