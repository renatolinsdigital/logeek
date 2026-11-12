---
paths:
  - "src/domain/components/**/*"
  - "src/domain/hooks/**/*"
  - "src/shared/**/*"
  - "src/pages/**/*"
---

# Room: ui

Depth: `{boilerplate}/guides/frontend/react.md`,
`{boilerplate}/guides/architecture/components.md`.

- Domain components are their own containers: they take actions straight
  from `useBoardStore` with one selector each. To read the whole board use
  `useBoard()` (it wraps `useShallow`); selecting a fresh object without
  `useShallow` re-renders forever in Zustand 5.
- Shared components never hold a word of their own: every visible or
  accessible text is a prop (`ToastViewport` takes `dismissLabel`).
- Icons are 8 by 8 bitmaps in `shared/components/PixelIcon/pixelIconBitmaps.ts`;
  add one there, `#` for a lit pixel.
- `ConditionRow` lays itself out with a container query, because the same
  row sits in a wide card on desktop and inside a nested group on a phone.
- Undo for removing a card uses the store's `lastRemovedCard`; Undo for
  Examples, Clear and a loaded share link keeps a board snapshot and calls
  `loadBoard`.
- `Modal` is open while mounted (render it conditionally) and sits on the
  native `<dialog>`. jsdom has no `showModal` or `close`, so
  `src/test/setup.ts` stubs them; a test finds it with `getByRole('dialog')`.
- A child's focus effect inside `Modal` runs after the dialog opens (the
  Modal opens in a layout effect), which is how `ImportJsonModal` focuses its
  field.
- Driving the page over the DevTools protocol (Chrome's
  `--remote-debugging-port`, Node's built-in `WebSocket`) can click, type
  and screenshot; `Emulation.setDeviceMetricsOverride` reaches 390px with no
  iframe. A JS `element.click()` does not focus the button, so focus checks
  need `element.focus()` first.
- Checking the page at phone width: headless Chrome will not go below about
  500px, so screenshot the app inside a 390px iframe served from the same
  origin (a `file://` page cannot frame it).
