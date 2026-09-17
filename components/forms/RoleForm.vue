<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { Permission, Role, RoleInput } from '~/types/access.type'

const props = defineProps<{ role: Role | null; permissions: Permission[]; saving: boolean; editable: boolean }>()
const emit = defineEmits<{ submit: [input: RoleInput]; cancel: [] }>()
const { can } = useConsoleAccess()
const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(z.object({
  name: z.string().regex(/^[a-z][a-z0-9_-]{1,49}$/, 'Gunakan 2–50 karakter: huruf kecil, angka, underscore atau strip.'),
  description: z.string().default(''),
})) })
const permissionIds = ref<number[]>([])
const active = ref(true)
watch(() => props.role, role => {
  resetForm({ values: { name: role?.name || '', description: role?.description || '' } })
  permissionIds.value = [...(role?.permission_ids || [])]
  active.value = role?.is_active ?? true
}, { immediate: true })
const groups = computed(() => props.permissions.filter(p => p.is_group).sort((a, b) => a.orders - b.orders))
const items = (group: Permission) => props.permissions.filter(p => p.parent_id === group.id && p.permission === 'index').sort((a, b) => a.orders - b.orders)
const actions = (item: Permission) => [item, ...props.permissions.filter(p => p.parent_id === item.id && !p.is_group)]
const labels: Record<string, string> = { index: 'Lihat', create: 'Tambah', update: 'Edit', delete: 'Hapus' }
const toggle = (p: Permission, checked: boolean) => {
  const selected = new Set(permissionIds.value)
  if (checked) {
    selected.add(p.id)
    if (p.permission !== 'index' && p.parent_id) selected.add(p.parent_id)
  } else {
    selected.delete(p.id)
    if (p.permission === 'index') props.permissions.filter(child => child.parent_id === p.id).forEach(child => selected.delete(child.id))
  }
  // Groups are derived by the backend from selected menu/action permissions.
  permissionIds.value = [...selected].filter(id => !props.permissions.find(p => p.id === id)?.is_group)
}
const submit = handleSubmit(values => emit('submit', { ...values, is_active: active.value, permission_ids: permissionIds.value.filter(id => !props.permissions.find(p => p.id === id)?.is_group) }), notifyFormValidationError)
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <fieldset :disabled="saving || !editable" class="min-w-0 space-y-6">
      <FormsFormSection :title="role ? `Role: ${role.name}` : 'Role baru'" description="Pilih menu dan tindakan yang boleh digunakan role ini.">
        <div class="form-grid">
          <FormsFieldsFieldXText name="name" label="Nama role" placeholder="contoh: content_editor" :disabled="role?.is_system" />
          <FormsFieldsFieldXText name="description" label="Deskripsi" placeholder="Tanggung jawab role" />
        </div>
        <label class="flex items-center gap-2 text-sm"><input v-model="active" type="checkbox" class="size-4 accent-primary" /> Role aktif</label>
      </FormsFormSection>
      <FormsFormSection title="Hak akses" description="Izin tambah, edit, atau hapus otomatis menyertakan izin lihat. Grup hanya tampil jika memiliki menu yang diizinkan.">
        <div v-for="group in groups" :key="group.id" class="overflow-hidden rounded-xl border">
          <h3 class="bg-muted/50 px-4 py-3 text-sm font-semibold">{{ group.menu }}</h3>
          <div v-for="item in items(group)" :key="item.id" class="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0"><p class="font-medium">{{ item.menu }}</p><p class="break-all text-xs text-muted-foreground">{{ item.route }}</p></div>
            <div class="flex flex-wrap gap-4">
              <label v-for="p in actions(item)" :key="p.id" class="flex items-center gap-2 text-sm">
                <input type="checkbox" class="size-4 accent-primary" :checked="permissionIds.includes(p.id) || role?.name === 'superadmin'" :disabled="!can(p.code)" @change="toggle(p, ($event.target as HTMLInputElement).checked)" />
                {{ labels[p.permission] }}
              </label>
            </div>
          </div>
        </div>
      </FormsFormSection>
    </fieldset>
    <div class="form-actions">
      <UiButton type="button" variant="outline" :disabled="saving" @click="emit('cancel')">Tutup</UiButton>
      <UiButton v-if="editable" type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan role' }}</UiButton>
    </div>
  </form>
</template>
