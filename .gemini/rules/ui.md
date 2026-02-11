# UI Guidelines

## Design System

- **Dark-only theme** — surface-900 background, no light mode. Use the semantic color tokens defined in `layout.css` (`surface-*`, `border`, `accent`, `ok`, `warn`, `danger`).
- **Mobile-first** — primary target is technicians on phones. Touch targets minimum 44px. Generous padding (`p-3`+). No hover-only interactions.
- **RTL Hebrew** — all text is Hebrew, flows right-to-left. Use logical CSS properties (`start`/`end`, `ps`/`pe`, `ms`/`me`) instead of `left`/`right`. The `dir="rtl"` is set globally.

## Component Patterns

- Rounded corners: cards/containers use `rounded-xl` or `rounded-2xl`, inputs use `rounded-lg`.
- Spacing: section gaps with `space-y-4`, tight groups with `space-y-2` or `gap-2`/`gap-3`.
- Section headers: `<h2>` with `text-lg font-bold text-white` + optional `<p>` subtitle in `text-sm text-gray-400`.
- Form labels: `text-sm font-medium text-gray-300` with `mb-1.5 block`.
- Cards: `border border-border bg-surface-800 p-3 rounded-xl`.
- Buttons: primary uses `bg-accent text-white`, secondary uses `bg-surface-700 text-gray-400`. Both get `rounded-xl`.
- Status colors: green (`ok`/`ok-dim`) for pass, yellow (`warn`/`warn-dim`) for warning, red (`danger`/`danger-dim`) for fail/delete.

## Animations

- Page/step transitions: `fade` with 250ms duration.
- List items entering: `fly` with `y: 10, duration: 350, easing: cubicOut`.
- Keep animations subtle and fast — no decorative motion.

## Haptics

- Use `haptic()` from `$lib/utils/haptics.js` on user actions: `'light'` for navigation, `'selection'` for tab switching, `'medium'` for mutations, `'success'`/`'error'` for outcomes.

## Accessibility

- All inputs must have associated `<label>` elements or `aria-label`.
- Interactive elements must use `<button>` or `<a>`, never bare `<div>` with `onclick`.
- Buttons that are icon-only need a `title` attribute in Hebrew.
