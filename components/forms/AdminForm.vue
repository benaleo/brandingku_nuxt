<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { AdminInput, AdminUser, Role } from '~/types/access.type'

const props = defineProps<{ admin: AdminUser | null; roles: Role[]; saving: boolean }>()
const emit = defineEmits<{ submit: [input: AdminInput]; cancel: [] }>()
const schema = computed(() => toTypedSchema(z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: props.admin ? z.string().max(72).refine(v => !v || v.length >= 8, 'Password minimal 8 karakter') : z.string().min(8, 'Password minimal 8 karakter').max(72),
})))
const { handleSubmit, resetForm } = useForm({ validationSchema: schema })
const roleId = ref<string>()
const active = ref(true)
const roleError = ref('')
watch(() => props.admin, admin => {
  resetForm({ values: { name: admin?.name || '', email: admin?.email || '', password: '' } })
  roleId.value = admin ? String(admin.role.id) : undefined; active.value = admin?.is_active ?? true; roleError.value = ''
}, { immediate: true })
const options = computed(() => props.roles.filter(r => r.is_active && r.name !== 'user').map(r => ({ id: String(r.id), label: r.name })))
const submit = handleSubmit(values => {
  if (!roleId.value) { roleError.value = 'Pilih role untuk admin'; notifyFormValidationError({ errors: { role: roleError.value } }); return }
  emit('submit', { name: values.name, email: values.email, password: values.password || undefined, role_id: Number(roleId.value), is_active: active.value })
}, notifyFormValidationError)
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <fieldset :disabled="saving">
      <FormsFormSection :title="admin ? 'Edit admin' : 'Tambah admin'" description="Tentukan role untuk mengatur menu dan hak akses admin.">
        <div class="form-grid">
          <FormsFieldsFieldXText name="name" label="Nama" placeholder="Nama lengkap" />
          <FormsFieldsFieldXText name="email" type="email" label="Email" placeholder="nama@perusahaan.com" />
          <div class="space-y-2">
            <FormsFieldsFieldXText name="password" type="password" label="Password" placeholder="Minimal 8 karakter" />
            <p v-if="admin" class="text-xs text-muted-foreground">Kosongkan jika password tidak diubah.</p>
          </div>
          <div class="space-y-2">
            <FormsFieldsFieldXSelectSimple v-model="roleId" name="role" label="Role" :options="options" placeholder="Pilih role" />
            <p v-if="roleError" class="text-sm text-destructive">{{ roleError }}</p>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm"><input v-model="active" type="checkbox" class="size-4 accent-primary" /> Akun aktif</label>
      </FormsFormSection>
    </fieldset>
    <div class="form-actions">
      <UiButton type="button" variant="outline" :disabled="saving" @click="emit('cancel')">Batal</UiButton>
      <UiButton type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan admin' }}</UiButton>
    </div>
  </form>
</template>
