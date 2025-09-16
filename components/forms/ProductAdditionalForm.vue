<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Edit, Plus, Replace, Trash2, X } from "lucide-vue-next";
import type { ProductAdditional } from "~/types/products.type";
import { useProductAdditionalService } from "~/services/product-additional.service";
import FieldXSelectSimple from "./fields/FieldXSelectSimple.vue";

const props = defineProps<{
  modelValue: ProductAdditional[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: ProductAdditional[]): void;
}>();

const additionalService = useProductAdditionalService()
const deletingKey = ref<string | null>(null)

const list = ref<ProductAdditional[]>(props.modelValue || []);

type AttrItem = { key: string; value: string; __k?: string }

function parseAttributes(attributes: string): {key: string, value: string}[] {
  try {
    return JSON.parse(attributes) || [];
  } catch {
    return [];
  }
}

function withKeys(arr: { key: string; value: string }[]): AttrItem[] {
  return (arr || []).map((it) => ({
    key: String(it?.key ?? ''),
    value: String(it?.value ?? ''),
    __k: `${Date.now()}-${Math.random()}`,
  }))
}

function serializeAttrs(arr: AttrItem[]): string {
  const clean = (arr || []).map((it) => ({ key: String(it.key ?? ''), value: String(it.value ?? '') }))
  return JSON.stringify(clean)
}

const parsedAttributes = ref<Record<number, AttrItem[]>>({})
// Cache the last serialized attributes string per item to avoid re-parsing on
// unrelated field changes (e.g., typing in name/price re-triggering deep watch)
const lastAttributesStr = ref<Record<number, string>>({})
// Guard to prevent reciprocal watchers from causing loops during manual syncs
const isSyncing = ref(false)
// Debounced emitter to batch updates and avoid tight deep-watch loops
let emitTimer: number | null = null
function queueEmit(delay = 150) {
  if (emitTimer != null) {
    clearTimeout(emitTimer as unknown as number)
  }
  emitTimer = window.setTimeout(() => {
    emitTimer = null
    try {
      // Emit a cloned payload to avoid parent-child shared reference pitfalls
      const payload = JSON.parse(JSON.stringify(list.value))
      emit("update:modelValue", payload)
    } catch (_) {
      emit("update:modelValue", list.value)
    }
  }, delay)
}

// JSON editor state per additional
const jsonEditorOpen = ref<Record<number, boolean>>({})
const jsonDraft = ref<Record<number, string>>({})

// Sync parsedAttributes with list.attributes, but only react to attribute string changes
watch(
  () => list.value.map((it) => it?.attributes ?? '[]'),
  (attrList) => {
    attrList.forEach((current, idx) => {
      if (lastAttributesStr.value[idx] !== current) {
        const parsed = withKeys(parseAttributes(current))
        // Only replace if content meaningfully changed to avoid triggering the other watcher unnecessarily
        const prevStr = serializeAttrs(parsedAttributes.value[idx] ?? [])
        const nextStr = serializeAttrs(parsed)
        if (prevStr !== nextStr) {
          parsedAttributes.value[idx] = parsed
        }
        lastAttributesStr.value[idx] = current
      }
    })
  },
  { immediate: true }
)

// Sync back to list when parsedAttributes changes
watch(
  parsedAttributes,
  (newVal) => {
    // Write back to list only when the serialized value is different to avoid
    // a deep watcher feedback loop that can lock the UI in production builds.
    if (isSyncing.value) return
    for (const idx in newVal) {
      const i = Number(idx)
      if (!list.value[i]) continue
      const nextStr = serializeAttrs(newVal[i] as AttrItem[])
      if (list.value[i].attributes !== nextStr) {
        list.value[i].attributes = nextStr
        // Keep cache in sync to avoid immediate re-parse by the other watcher
        lastAttributesStr.value[i] = nextStr
      }
    }
  },
  { deep: true }
)

// Update attributes array back to string
// Removed updateAttributes, now handled by watcher

// Initialize attributes if empty
watch(
  () => props.modelValue,
  (v) => {
    try {
      isSyncing.value = true
      const incoming = (v || []).map((item, idx) => {
        // preserve existing stable key if available
        const prevKey = list.value?.[idx]?._uniqueKey
        const stableKey = item._uniqueKey ?? prevKey ?? (item.id ? undefined : `new-${idx}`)
        return {
          ...item,
          _uniqueKey: stableKey,
        }
      })
      // Avoid unnecessary reassignment if meaningfully equal
      const prevStr = JSON.stringify(list.value)
      const nextStr = JSON.stringify(incoming)
      if (prevStr !== nextStr) {
        list.value = incoming
        // Reset caches when the external model changes
        lastAttributesStr.value = {}
      }
    } finally {
      isSyncing.value = false
    }
  },
  { immediate: true }
);

// Note: Do not emit on every deep change to avoid focus loss while typing.
// We only emit on structural operations (add/remove/apply JSON).

function addAdditional() {
  list.value.push({
    _uniqueKey: `new-${Date.now()}-${Math.random()}`,
    name: "",
    price: 0,
    moq: 0,
    stock: 0,
    discount: 0,
    discount_type: "AMOUNT",
    attributes: "[]",
  });
  queueEmit()
}

function addAttribute(additionalIdx: number) {
  if (!parsedAttributes.value[additionalIdx]) parsedAttributes.value[additionalIdx] = []
  parsedAttributes.value[additionalIdx].push({ key: "", value: "", __k: `${Date.now()}-${Math.random()}` })
  // Manually sync back to list for only this index to avoid heavy deep-watch churn
  if (list.value[additionalIdx]) {
    try {
      isSyncing.value = true
      const nextStr = serializeAttrs(parsedAttributes.value[additionalIdx])
      if (list.value[additionalIdx].attributes !== nextStr) {
        list.value[additionalIdx].attributes = nextStr
        lastAttributesStr.value[additionalIdx] = nextStr
      }
    } finally {
      isSyncing.value = false
    }
  }
  queueEmit()
}

function removeAttribute(additionalIdx: number, attrIdx: number) {
  const nextStr = serializeAttrs(parsedAttributes.value[additionalIdx].filter((_, i) => i !== attrIdx))
  parsedAttributes.value[additionalIdx].splice(attrIdx, 1)
  // Manually sync back to list for only this index
  if (list.value[additionalIdx]) {
    try {
      isSyncing.value = true
      if (list.value[additionalIdx].attributes !== nextStr) {
        list.value[additionalIdx].attributes = nextStr
        lastAttributesStr.value[additionalIdx] = nextStr
      }
    } finally {
      isSyncing.value = false
    }
  }
  queueEmit()
}

async function removeAdditional(id: number, idx: number) {
  const item = list.value[idx];
  if (!item) return
  // If item has ID -> delete from backend first, then remove locally
  if (item.id) {
    try {
      deletingKey.value = String(id)
      await additionalService.deleteProductAdditional(Number(item.id))
      list.value.splice(idx, 1)
    } catch (e) {
    } finally {
      deletingKey.value = null
    }
  } else {
    // New (unsaved) item, just remove from UI
    list.value.splice(idx, 1)
  }
  queueEmit()
}

function normalizeAttributes(input: any): { key: string; value: string }[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((it: any) => it && typeof it === 'object')
    .map((it: any) => ({
      key: String(it.key ?? ''),
      value: String(it.value ?? ''),
    }))
}

function openJsonEditor(addIdx: number) {
  const current = parsedAttributes.value[addIdx] || []
  jsonDraft.value[addIdx] = JSON.stringify(current, null, 2)
  jsonEditorOpen.value[addIdx] = true
}

function cancelJson(addIdx: number) {
  jsonEditorOpen.value[addIdx] = false
}

function formatJson(addIdx: number) {
  try {
    const parsed = JSON.parse(jsonDraft.value[addIdx] || '[]')
    const normalized = normalizeAttributes(parsed)
    jsonDraft.value[addIdx] = JSON.stringify(normalized, null, 2)
  } catch (e) {
    console.warn('Invalid JSON; cannot format')
  }
}

function applyJson(addIdx: number) {
  try {
    const parsed = JSON.parse(jsonDraft.value[addIdx] || '[]')
    const normalized = normalizeAttributes(parsed)
    parsedAttributes.value[addIdx] = withKeys(normalized)
    jsonEditorOpen.value[addIdx] = false
    queueEmit()
  } catch (e) {
    console.warn('Invalid JSON; cannot apply')
  }
}

async function copyJson(addIdx: number) {
  try {
    const data = parsedAttributes.value[addIdx] || []
    const text = JSON.stringify(data, null, 2)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback: open editor with content selected
      jsonDraft.value[addIdx] = text
      jsonEditorOpen.value[addIdx] = true
    }
  } catch (e) {
    console.warn('Copy failed')
  }
}

// Read clipboard with a short timeout to avoid hanging the UI in production
// when clipboard permissions are blocked or the promise stalls.
async function readClipboardTextSafe(timeoutMs = 1000): Promise<string | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      return null
    }
    const read = navigator.clipboard.readText()
    const timed = new Promise<string>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id as unknown as number)
        reject(new Error('Clipboard read timeout'))
      }, timeoutMs)
    })
    // Race read vs timeout
    return await Promise.race([read, timed])
      .then((v) => (typeof v === 'string' ? v : null))
      .catch(() => null)
  } catch (_) {
    return null
  }
}

async function pasteJson(addIdx: number) {
  // Open the editor immediately to keep the UI responsive
  jsonEditorOpen.value[addIdx] = true
  try {
    const text = await readClipboardTextSafe(1200)
    if (text != null) {
      jsonDraft.value[addIdx] = text
    } else {
      // Leave the editor open for manual paste if clipboard read failed
      if (!jsonDraft.value[addIdx]) jsonDraft.value[addIdx] = ''
    }
  } catch (_) {
    // Fallback already open; no further action needed
  }
}

</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">Additionals</h3>
      <Button type="button" @click="addAdditional">Add Additional</Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <div
        v-for="(additional, addIdx) in list"
        :key="additional.id ?? additional._uniqueKey"
        class="border rounded p-4 relative w-full"
      >
        <Button
          type="button"
          variant="destructive"
          class="absolute top-2 right-2 cursor-pointer"
          @click="removeAdditional(Number(additional.id ?? addIdx), addIdx)"
          :disabled="deletingKey === String(addIdx)"
        >
          <Trash2 />
        </Button>
        <div class="w-full grid grid-cols-2 gap-2 mt-4">
          <div class="w-full">
            <label class="form-label mb-2">Name</label>
            <Input
              placeholder="Name"
              v-model="additional.name"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Price</label>
            <Input
              type="number"
              placeholder="Price"
              v-model.number="additional.price"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">MOQ</label>
            <Input
              type="number"
              placeholder="MOQ"
              v-model.number="additional.moq"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Stock</label>
            <Input
              type="number"
              placeholder="Stock"
              v-model.number="additional.stock"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Discount</label>
            <Input
              type="number"
              placeholder="Discount"
              v-model.number="additional.discount"
            />
          </div>
          <FieldXSelectSimple
            item-class="w-full"
            :name="`additionals.${addIdx}.discount_type`"
            label="Discount Type"
            placeholder="Discount Type"
            v-model="additional.discount_type"
            :standalone="true"
            :options="[
              { id: 'AMOUNT', label: 'Amount' },
              { id: 'PERCENTAGE', label: 'Percentage' },
            ]"
          />
          <div class="w-full px-1 col-span-2">
            <label class="block form-label mb-2">Attributes</label>
            <Card class="pt-0">
              <CardContent class="pt-4">
                <!-- JSON toolbar -->
                <div class="flex items-center justify-end gap-2 mb-3">
                  <Button type="button" variant="outline" size="sm" @click="copyJson(addIdx)">
                    <Copy class="h-4 w-4 mr-2" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" @click="pasteJson(addIdx)">
                    <Replace class="h-4 w-4 mr-2" />
                  </Button>
                  <Button type="button" variant="secondary" size="sm" @click="openJsonEditor(addIdx)">
                    <Edit class="h-4 w-4 mr-2" />
                  </Button>
                </div>

                <!-- JSON editor -->
                <div v-if="jsonEditorOpen[addIdx]" class="mb-4">
                  <textarea
                    v-model="jsonDraft[addIdx]"
                    class="w-full h-40 p-2 border rounded font-mono text-sm"
                    placeholder='[
  { "key": "Color", "value": "Red, Blue" }
]'
                  ></textarea>
                  <div class="flex items-center gap-2 mt-2">
                    <Button type="button" size="sm" @click="applyJson(addIdx)">Apply</Button>
                    <Button type="button" variant="outline" size="sm" @click="formatJson(addIdx)">Format</Button>
                    <Button type="button" variant="ghost" size="sm" @click="cancelJson(addIdx)">Cancel</Button>
                  </div>
                  <div class="text-xs text-muted-foreground mt-2">
                    Tips: Masukkan array JSON berisi objek { key, value }. Contoh nilai dapat berupa "Red, Blue" untuk multiple values.
                  </div>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="(attr, attrIdx) in parsedAttributes[addIdx]"
                    :key="attr.__k || attrIdx"
                    class="grid grid-cols-12 gap-3 items-end"
                  >
                    <div class="col-span-5">
                      <label v-if="attrIdx === 0" class="text-sm font-medium mb-1 block">Key</label>
                      <Input v-model="attr.key" placeholder="e.g. Color" />
                    </div>
                    <div class="col-span-5">
                      <label v-if="attrIdx === 0" class="text-sm font-medium mb-1 block">Value</label>
                      <Input v-model="attr.value" placeholder="e.g. Red" />
                    </div>
                    <div class="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        class="text-muted-foreground hover:text-destructive"
                        @click="removeAttribute(addIdx, attrIdx)"
                        title="Remove attribute"
                      >
                        <X class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" @click="addAttribute(addIdx)">
                      <Plus class="h-4 w-4 mr-2" /> Add Attribute
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
