<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import type { AdminInput, AdminUser, Role } from '~/types/access.type'

const props = defineProps<{ admin: AdminUser | null; roles: Role[]; saving: boolean }>()
const emit = defineEmits<{ submit: [input: AdminInput]; cancel: [] }>()
const schema = computed(() => toTypedSchema(z.object({
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: props.admin ? z.string().max(72).refine(v => !v || v.length >= 8, 'Password minimal 8 karakter') : z.string().min(8, 'Password minimal 8 karakter').max(72),
})))
const { handleSubmit, resetForm } = useForm({ validationSchema: schema })
const roleId = ref<string>()
const active = ref(true)
const roleError = ref('')
const avatarFile = ref<File | null>(null)
const avatarUrl = ref('')
const avatarRemoved = ref(false)
const preparing = ref(false)
const config = useRuntimeConfig()
const busy = computed(() => props.saving || preparing.value)
watch(() => props.admin, admin => {
  resetForm({ values: { name: admin?.name || '', email: admin?.email || '', password: '', address: admin?.address || '', phone: admin?.phone || '' } })
  avatarFile.value = null
  avatarRemoved.value = false
  avatarUrl.value = admin?.avatar ? (/^https?:\/\//.test(admin.avatar) ? admin.avatar : String(config.public.STORAGE_URL) + admin.avatar) : ''
  roleId.value = admin ? String(admin.role.id) : undefined; active.value = admin?.is_active ?? true; roleError.value = ''
}, { immediate: true })
const options = computed(() => props.roles.filter(r => r.is_active && r.name !== 'user').map(r => ({ id: String(r.id), label: r.name })))
const submit = handleSubmit(async values => {
  if (busy.value) return
  if (!roleId.value) { roleError.value = 'Pilih role untuk admin'; notifyFormValidationError({ errors: { role: roleError.value } }); return }
  preparing.value = true
  try {
    const avatar = avatarFile.value ? await useFileToBase64().convertToBase64(avatarFile.value) : avatarRemoved.value ? '' : undefined
    emit('submit', { ...values, avatar, password: values.password || undefined, role_id: Number(roleId.value), is_active: active.value })
  } catch (error) { toast.error(getErrorMessage(error)) }
  finally { preparing.value = false }
}, notifyFormValidationError)
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <fieldset :disabled="busy">
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
        <div class="form-grid">
          <FormsFieldsFieldXText name="phone" type="tel" label="Telepon (opsional)" placeholder="Nomor telepon" />
          <FormsFieldsFieldXText name="address" label="Alamat (opsional)" placeholder="Alamat lengkap" />
        </div>
        <FormsImageSingleUploadField v-model:file="avatarFile" v-model:file-url="avatarUrl" label="Avatar (opsional)" :disabled="busy" :delete-from-storage="false" @delete="avatarRemoved = true" />
        <label class="flex items-center gap-2 text-sm"><input v-model="active" type="checkbox" class="size-4 accent-primary" /> Akun aktif</label>
      </FormsFormSection>
    </fieldset>
    <div class="form-actions">
      <UiButton type="button" variant="outline" :disabled="busy" @click="emit('cancel')">Batal</UiButton>
      <UiButton type="submit" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan admin' }}</UiButton>
    </div>
  </form>
</template>
