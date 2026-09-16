<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# sheet

## Purpose
This directory holds the shadcn-vue "Sheet" component family — a slide-in panel (drawer) built as a thin styling wrapper over `reka-ui`'s Dialog primitives. It is part of the project's local UI kit under `components/ui`, which `nuxt.config.ts` registers through `shadcn-nuxt` with `componentDir: './components/ui'` and `prefix: 'Ui'`, so these components are available in templates as `UiSheet`, `UiSheetContent`, etc., and also importable directly from `@/components/ui/sheet`. Inside brandingku_nuxt its only current consumer is `components/ui/sidebar/Sidebar.vue`, which renders the mobile sidebar as a `Sheet`.

## Key Files

| File | Description |
| --- | --- |
| `index.ts` | Barrel that re-exports 8 components as named exports; `SheetOverlay` is deliberately not exported because `SheetContent` renders it internally. |
| `Sheet.vue` | Root wrapper over `DialogRoot`; forwards all `DialogRootProps`/`DialogRootEmits` via `useForwardPropsEmits`, emits `data-slot="sheet"`. |
| `SheetTrigger.vue` | Passthrough over `DialogTrigger` with `DialogTriggerProps`, no styling; `data-slot="sheet-trigger"`. |
| `SheetClose.vue` | Passthrough over `DialogClose` with `DialogCloseProps`, no styling; `data-slot="sheet-close"`. |
| `SheetContent.vue` | The panel itself: `DialogPortal` > `SheetOverlay` + `DialogContent`. Adds a `side` prop (`top`/`right`/`bottom`/`left`, default `right`) that selects the position/size/slide-animation classes, sets `inheritAttrs: false` and re-merges `$attrs` manually, and always renders a built-in `DialogClose` button with a lucide `X` icon plus an `sr-only` "Close" label. |
| `SheetOverlay.vue` | Backdrop over `DialogOverlay` (`fixed inset-0 z-50 bg-black/80` with fade in/out on `data-[state]`); internal to `SheetContent` but accepts a `class` override if imported by file path. |
| `SheetHeader.vue` | Plain `<div>` (no reka-ui primitive) with `flex flex-col gap-1.5 p-4`; only prop is `class`. |
| `SheetFooter.vue` | Plain `<div>` with `mt-auto flex flex-col gap-2 p-4`; only prop is `class`. Note the stray line break inside the `:class` binding (the `cn(...)` call closes, then a newline before the closing quote) — harmless but inconsistent with the sibling files. |
| `SheetTitle.vue` | Wrapper over `DialogTitle` styled `text-foreground font-semibold`; required for dialog accessibility labelling. |
| `SheetDescription.vue` | Wrapper over `DialogDescription` styled `text-muted-foreground text-sm`. |

## For AI Agents

### Working In This Directory
These files were scaffolded by the shadcn-vue CLI (`components.json` pins `"style": "new-york"`, `"baseColor": "neutral"`, `"iconLibrary": "lucide"`), so they are generated-then-owned source: they live in the repo and are meant to be edited locally, but re-running `pnpm dlx shadcn-vue@latest add sheet` will overwrite everything here, including any local tweaks. Prefer hand-editing over re-adding, and if you do re-add, diff the result before keeping it.

Rules that the existing files follow and that changes should keep:

- Never hardcode a `class` attribute where a consumer might need to override it — strip `class` out of the forwarded props and merge with `cn()` (see `SheetTitle.vue`, `SheetDescription.vue`, `SheetOverlay.vue` using a `computed` destructure; `SheetContent.vue` using `reactiveOmit`).
- If you add a new component file, also add its export line to `index.ts`, or it will only be reachable by direct file path (this is why `Sidebar.vue` imports `SheetDescription`/`SheetHeader`/`SheetTitle` by path — they were once missing from the barrel; `SheetOverlay` is still intentionally absent).
- `SheetContent.vue` is the one file with non-trivial logic. It sets `inheritAttrs: false` and spreads `{ ...forwarded, ...$attrs }`, so `$attrs` wins over forwarded props — keep that order in mind when changing prop plumbing, and remember `side` must stay in the `reactiveOmit` list so it is not passed down to the DOM.
- Accessibility: `SheetContent` mounts a `DialogClose` unconditionally, and reka-ui's Dialog warns when there is no title/description. `Sidebar.vue` satisfies this with an `sr-only` `SheetHeader` containing `SheetTitle` + `SheetDescription`; new call sites should do the same rather than omitting them.
- Styling relies on Tailwind v4 utilities plus `tw-animate-css` animation classes (`animate-in`, `slide-in-from-right`, `fade-out-0`) driven by reka-ui's `data-[state=open|closed]` attributes, and on the theme CSS variables (`bg-background`, `text-foreground`, `text-muted-foreground`, `focus:ring-ring`). Do not swap these for literal colors.
- Every rendered element carries a `data-slot="sheet-*"` attribute; preserve that naming if you add markup, since it is the convention across this UI kit.

### Testing Requirements
There is no test coverage for this directory, and no test runner in the project at all — `package.json` defines no test script and has no vitest/jest/playwright dependency. Verify changes by running the app and exercising a real sheet:

- `pnpm dev`, then open a viewport narrow enough to trigger the mobile branch in `components/ui/sidebar/Sidebar.vue` (`isMobile`) and confirm the panel slides in, the overlay dims, Escape and the `X` button close it, and focus returns correctly.
- `pnpm build` to confirm the change compiles (there is no separate typecheck script; the Nuxt build is the type/compile gate).
- If you change the `side` prop handling, check all four values by hand — no snapshot or visual test will catch a broken variant.

### Common Patterns
- **Primitive wrapping.** Each file imports a reka-ui `Dialog*` primitive plus its `*Props` type, declares `defineProps<ThatProps>()`, and forwards. Stateful roots (`Sheet`) use `useForwardPropsEmits`; leaf passthroughs (`SheetTrigger`, `SheetClose`) just `v-bind="props"`.
- **Class delegation.** Two idioms coexist: `computed(() => { const { class: _, ...delegated } = props; return delegated })` in the simple wrappers, and `reactiveOmit(props, 'class', 'side')` from `@vueuse/core` in `SheetContent.vue`. Both exist to keep `class` out of the forwarded prop bag.
- **`cn()` everywhere.** Styled components compose `cn('<defaults>', props.class)` so `tailwind-merge` lets callers override any default utility.
- **Composition, not configuration.** `SheetContent` is the only component with variants; layout components (`SheetHeader`, `SheetFooter`) are deliberately dumb divs with no primitive behind them.
- **Script style.** All files use `<script setup lang="ts">`, type-only prop declarations, and `type HTMLAttributes` imported from `vue` for the `class` prop type.

## Dependencies

### Internal
- `lib/utils.ts` — the `cn()` helper (`clsx` + `twMerge`), imported as `@/lib/utils` by every styled component here.
- `components.json` — shadcn-vue CLI config (style, base color, `@/components/ui` alias) that governs regeneration of these files.
- `nuxt.config.ts` — the `shadcn` block (`prefix: 'Ui'`, `componentDir: './components/ui'`) that makes these components auto-importable.
- `components/ui/sidebar/Sidebar.vue` — the only in-repo consumer; changes to `SheetContent`'s props or `index.ts` exports can break it.
- `assets/css/tailwind.css` — source of the theme CSS variables the class strings reference.

### External
- `reka-ui` — `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogContent`, `DialogOverlay`, `DialogClose`, `DialogTitle`, `DialogDescription`, and `useForwardPropsEmits`.
- `vue` — `<script setup>` macros, `computed`, `HTMLAttributes`.
- `@vueuse/core` — `reactiveOmit` in `SheetContent.vue`.
- `lucide-vue-next` — the `X` close icon.
- `tailwindcss` v4 + `tailwind-merge` + `clsx` (via `cn()`), and `tw-animate-css` for the enter/exit animation utilities.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
