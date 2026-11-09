# 0005. Tailwind CSS for styling, with shared form controls

- Status: accepted
- Date: 2026-11-09

## Context

The UI mockup defines a consistent look across the login page, File caricati, Tabella dati and Chat. Several parallel tasks will build pages at the same time, so styling must follow one approach that every task applies the same way, and the product owner asked for custom form controls instead of the browser's native ones (for example `<select>`).

## Decision

- Style with **Tailwind CSS** utility classes only. `create-next-app` sets it up in M1; `prettier-plugin-tailwindcss` keeps class order consistent.
- No custom CSS files beyond the global entry, no CSS modules, no CSS-in-JS, no other styling libraries. A set of classes that repeats becomes a component.
- Form controls (select, input, button) are shared components in `src/components/ui/`. A native `<select>` is never rendered. The component library behind them (for example Radix primitives via shadcn/ui, which are styled with Tailwind) is chosen in M3 with its own ADR, when the first filter is built.

## Consequences

- Styles live next to the markup, so parallel tasks do not conflict on shared stylesheets.
- Long class lists in JSX; mitigated by extracting components.
- Accessibility of custom controls (keyboard, screen reader) depends on the chosen primitives, which is why a library is preferred over controls written from scratch.

## Alternatives considered

- **CSS Modules:** familiar CSS, but one more file per component and no shared design scale.
- **A full component kit with its own theme (MUI, Chakra):** fast start, but a look that is hard to bend to the mockup and a second styling system next to Tailwind.
