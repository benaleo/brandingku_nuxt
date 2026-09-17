<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { MyProfile } from '~/services/profile.service'

const props = defineProps<{ profile: MyProfile | null; saving: boolean }>()
const emit = defineEmits<{ submit: [values: { name: string; phone?: string; address?: string; avatarFile: File | null }] }>()
const config = useRuntimeConfig()
const schema = toTypedSchema(z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
}))
const { handleSubmit, resetForm } = useForm({ validationSchema: schema })
const avatarFile = ref<File | null>(null)
const avatarUrl = ref('')

watch(() => props.profile, profile => {
  resetForm({ values: { name: profile?.name || '', phone: profile?.phone || '', address: profile?.address || '' } })
  avatarFile.value = null
  avatarUrl.value = profile?.avatar ? (/^https?:\/\//.test(profile.avatar) ? profile.avatar : String(config.public.STORAGE_URL) + profile.avatar) : ''
}, { immediate: true })

const submit = handleSubmit(values => {
  emit('submit', { ...values, avatarFile: avatarFile.value })
}, notifyFormValidationError)
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <fieldset :disabled="saving">
      <FormsFormSection title="Informasi profil" description="Perbarui nama, alamat, nomor telepon, dan foto profil Anda.">
        <div class="form-grid">
          <FormsFieldsFieldXText name="name" label="Nama" placeholder="Nama lengkap" />
          <FormsFieldsFieldXText name="phone" type="tel" label="Telepon" placeholder="Nomor telepon" />
        </div>
        <FormsFieldsFieldXArea name="address" label="Alamat" placeholder="Alamat lengkap" />
        <FormsImageSingleUploadField v-model:file="avatarFile" v-model:file-url="avatarUrl" label="Avatar" :disabled="saving" :delete-from-storage="false" />
      </FormsFormSection>
    </fieldset>
    <div class="form-actions">
      <UiButton type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan perubahan' }}</UiButton>
    </div>
  </form>
</template>
