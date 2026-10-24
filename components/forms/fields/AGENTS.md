<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# fields

## Purpose
Thin `FieldX*` wrappers that pair a shadcn form primitive with vee-validate binding and error display, so individual forms never wire validation state by hand.

## Key Files

| File | Description |
|------|-------------|
| `FieldXText.vue` | Single-line text input. |
| `FieldXArea.vue` | Multi-line textarea. |
| `FieldXCheckbox.vue` | Checkbox field. |
| `FieldXSearch.vue` | Search input with its own filtering affordance. |
| `FieldXSelect.vue` | Select field. |
| `FieldXSelectSimple.vue` | Reduced select variant for plain option lists. |
| `FieldXSelectWithGroupParent.vue` | Grouped select for parent/child hierarchies — used for nested product categories. |
| `FieldXVueEditor.vue` | Rich-text editor backed by `quill` (v2, via `components/editor/QuillEditor.vue`). Quill loads only in the browser (dynamic import on mount). |

## For AI Agents

### Working In This Directory
- Keep the `FieldX` prefix. Forms rely on the naming, and it separates these from the raw `Ui*` primitives underneath.
- Each wrapper owns its label, description and error slot wiring. Add new field types here rather than inlining the pattern into a form.
- `FieldXVueEditor.vue` renders the editor inside `<ClientOnly>`; Quill itself is imported in `onMounted`, so keep it client-guarded.

### Testing Requirements
- `pnpm run build`.
- Verify validation messages appear by submitting an invalid form in `pnpm run dev`.

## Dependencies

### Internal
- `components/ui/form/`, `components/ui/input/`, `components/ui/select/`, `components/ui/textarea/`
- `components/editor/QuillEditor.vue`

### External
- `@vee-validate/zod`, `quill` (v2, via `components/editor/QuillEditor.vue`), `reka-ui`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
