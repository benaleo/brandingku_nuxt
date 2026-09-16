<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# form

## Purpose
shadcn-vue "Form" primitive set: a thin, accessibility-focused wrapper layer over `vee-validate`. It does not implement validation itself — `Form`, `FormField` and `FormFieldArray` are re-exported straight from `vee-validate`, and the local `.vue` files only supply the surrounding markup (item wrapper, label, control slot, description, error message) plus the ARIA id wiring that links them together. In brandingku_nuxt this directory is the shared substrate under `components/forms/**`: the reusable field components (`components/forms/fields/FieldX*.vue`) and the page-level forms (`LoginForm.vue`, `RegisterForm.vue`, `ProductCategoryForm.vue`, the console reset-password pages) all import from `@/components/ui/form`.

## Key Files
| File | Description |
| --- | --- |
| `index.ts` | Public barrel: exports the five local components, `FORM_ITEM_INJECTION_KEY`, and re-exports `Form`, `Field as FormField`, `FieldArray as FormFieldArray` from `vee-validate`. |
| `useFormField.ts` | Composable joining `vee-validate`'s `FieldContextKey` with the local item id; returns `id`, `name`, the derived `formItemId` / `formDescriptionId` / `formMessageId` strings, and field state (`valid`, `isDirty`, `isTouched`, `error`). Throws `useFormField should be used within <FormField>` when no field context is present. |
| `injectionKeys.ts` | Declares `FORM_ITEM_INJECTION_KEY` as `Symbol() as InjectionKey<string>` — the channel `FormItem` uses to hand its generated id to descendants. |
| `FormItem.vue` | Wrapper `div` (`data-slot="form-item"`, classes `grid gap-2 px-1`). Generates an id via reka-ui `useId()` and `provide()`s it under `FORM_ITEM_INJECTION_KEY`; every other component here depends on this provider. |
| `FormLabel.vue` | Renders `@/components/ui/label`'s `Label` with `:for="formItemId"`, `:data-error="!!error"` and the error class `data-[error=true]:text-destructive-foreground`. Props are `LabelProps & { class }`. |
| `FormControl.vue` | reka-ui `Slot` that stamps `id`, `aria-invalid` and a computed `aria-describedby` (description id alone when valid, description + message ids when errored) onto whatever single child input is slotted in. |
| `FormDescription.vue` | `<p>` carrying `formDescriptionId`, styled `text-muted-foreground text-sm`. |
| `FormMessage.vue` | `vee-validate` `ErrorMessage` rendered `as="p"` with `formMessageId` and `:name="toValue(name)"`, styled `text-destructive-foreground text-sm`. |

## For AI Agents

### Working In This Directory
- This is generated/vendored shadcn-vue code (`components.json`: style `new-york`, TypeScript, base color `neutral`, `ui` alias `@/components/ui`). Prefer re-adding via the shadcn-vue CLI over hand-writing new primitives; if you must hand-edit, keep the edit minimal and be aware a CLI re-add will overwrite it.
- Two deviations from stock shadcn-vue already exist here and must not be "fixed" casually: `FormItem` adds `px-1` to `grid gap-2`, and both `FormLabel` and `FormMessage` use `text-destructive-foreground` (not `text-destructive`). Consumers rely on the current spacing/colour.
- The whole set is coupled through injection. `FormLabel`, `FormControl`, `FormDescription` and `FormMessage` call `useFormField()`, which needs **both** `vee-validate`'s field context (a surrounding `FormField`) **and** the id provided by `FormItem`. Rendering any of them outside that pair throws at setup. Keep the `FormField > FormItem > (FormLabel, FormControl, FormMessage)` nesting when changing markup.
- `FormControl` is a reka-ui `Slot`: it must receive exactly one element/component child, and it forwards the ARIA attributes to that child rather than emitting a wrapper. Do not add sibling nodes inside it.
- If you add a component here, export it from `index.ts` — consumers import from the barrel (`@/components/ui/form`), not from individual files.
- `shadcn-nuxt` is configured with `prefix: 'Ui'` and `componentDir: './components/ui'` in `nuxt.config.ts`, so auto-imported names are `Ui`-prefixed; existing consumers bypass this with explicit named imports from the barrel. Follow the explicit-import style already used in `components/forms/**`.

### Testing Requirements
There is no test setup covering this directory — the repo has no test runner, no test script in `package.json`, and no test files. Verification is manual: run `pnpm dev` and exercise a real consumer (for example `components/forms/LoginForm.vue`, or `components/forms/fields/FieldXText.vue` in its non-`standalone` branch), checking that the label's `for` matches the input id, that `aria-describedby` / `aria-invalid` flip when a field errors, and that `FormMessage` renders the validation text. `pnpm build` is the only automated gate and will surface type errors in the props/imports here.

### Common Patterns
- `<script lang="ts" setup>` with `defineProps<{ class?: HTMLAttributes['class'] }>()` and class composition through `cn()` from `@/lib/utils` (clsx + tailwind-merge), so caller classes win over defaults.
- Every rendered root gets a `data-slot="form-*"` attribute for styling/targeting.
- Ids are derived, never passed: one reka-ui `useId()` in `FormItem` becomes `${id}-form-item`, `${id}-form-item-description`, `${id}-form-item-message` in `useFormField`.
- Error state is read from `vee-validate` (`useFieldError`) and expressed as a `data-error` attribute plus a `data-[error=true]:` Tailwind variant, rather than conditional classes.
- `useFormField` also exposes `valid`, `isDirty` and `isTouched`, which no component in this directory currently consumes — they are there for callers.

## Dependencies

### Internal
- `/media/beno/Data/code/others/learn/brandingku/brandingku_nuxt/lib/utils.ts` — `cn()` class merger, used by four of the five components.
- `/media/beno/Data/code/others/learn/brandingku/brandingku_nuxt/components/ui/label` — `Label` re-styled by `FormLabel`.
- Consumed by `/media/beno/Data/code/others/learn/brandingku/brandingku_nuxt/components/forms/` (`LoginForm.vue`, `RegisterForm.vue`, `ProductCategoryForm.vue`, `fields/FieldXText.vue`, `fields/FieldXArea.vue`, `fields/FieldXSelect.vue`, `fields/FieldXCheckbox.vue`, `fields/FieldXVueEditor.vue`) and by `/media/beno/Data/code/others/learn/brandingku/brandingku_nuxt/pages/console/auth/reset-password/`.

### External
- `vee-validate` — `Form`, `Field`, `FieldArray`, `ErrorMessage`, `FieldContextKey`, `useFieldError`, `useIsFieldValid`, `useIsFieldDirty`, `useIsFieldTouched`.
- `reka-ui` — `useId`, `Slot`, `LabelProps`.
- `vue` — `provide` / `inject`, `InjectionKey`, `toValue`, `HTMLAttributes`.
- `clsx` + `tailwind-merge` (indirectly, via `cn`) and Tailwind CSS v4 utility/variant syntax.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
