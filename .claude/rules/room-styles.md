---
paths:
  - "apps/web/src/styles/**/*"
  - "apps/web/src/**/*.scss"
---

# Room: styles

Depth: `{boilerplate}/guides/frontend/styling-sass.md`.

- The look is colourful brutalism with an 80s arcade feel: thick ink
  borders, hard offset shadows, square corners, the Press Start 2P pixel
  font for labels and Space Mono for text. Dark "CRT" panels (scanlines,
  neon) hold the outputs.
- `$card-colors` in `_theme.scss` drives every `data-color` attribute
  (cards, flowchart nodes, header steps). A new card colour goes in that map
  and in `CARD_COLORS` in `domain/models/logic.model.ts`.
- Fonts are self-hosted through `@fontsource` packages, imported in
  `main.tsx`: no request leaves for Google Fonts.
- Vitest renders CSS modules with plain, unscoped class names
  (`classNameStrategy: 'non-scoped'` in `vite.config.ts`).
