---
'@vitecharts/react': minor
'@vitecharts/vue': minor
'@vitecharts/wc': minor
---

Framework adapters over the shared core:

- `@vitecharts/wc` — `<vitecharts-chart>` web component (zero deps, any framework).
- `@vitecharts/react` — `<Chart />` with a ref to the imperative instance.
- `@vitecharts/vue` — `<ViteChart :options>` with reactive deep updates.

Each creates one core `Chart`, applies option changes, and tears down on unmount.
