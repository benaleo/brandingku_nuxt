<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { getIdFromPath, getPathWithoutIdInForm } from '~/utils/global.utils'
import { useAdminSmtpService } from '~/services/admin-smtp.service'
import FieldXText from '~/components/forms/fields/FieldXText.vue'
import FieldXCheckbox from '~/components/forms/fields/FieldXCheckbox.vue'
import FormButton from '~/components/atoms/FormButton.vue'
import type { AdminSmtp } from '~/types/admin-smtp.type'

const router = useRouter()
const currentPath = router.currentRoute.value.path
const id = getIdFromPath(currentPath)
const isCreate = currentPath.endsWith('/add')
const disabled = currentPath.includes('/detail')

const { datas, loading, error, createSmtp, updateSmtp } = useAdminSmtpService(false, isCreate ? undefined : id)

const optionalNumber = z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().min(0).optional())

const formSchema = toTypedSchema(z.object({
  email: z.string().trim().email('Email tidak valid'),
  app_password: z.string().optional().default(''),
  provider: z.string().trim().min(1, 'Provider wajib diisi'),
  host: z.string().trim().min(1, 'Host wajib diisi'),
  port: z.coerce.number().int().min(1, 'Port tidak valid').max(65535, 'Port tidak valid'),
  sender_name: z.string().optional().default(''),
  branch: z.string().max(10, 'Branch maksimal 10 karakter').optional().default(''),
  secret: z.string().optional().default(''),
  quota: z.coerce.number().int().min(0, 'Quota tidak boleh negatif'),
  available_today: optionalNumber,
  is_active: z.coerce.boolean(),
}))

const { isFieldDirty, handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: '',
    app_password: '',
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    sender_name: 'Brandingku',
    branch: '',
    secret: '',
    quota: 500,
    available_today: undefined,
    is_active: true,
  },
})

const isActive = ref(true)
const stored = ref<AdminSmtp | null>(null)
const ready = ref(isCreate)

watch(datas, (val: AdminSmtp | null) => {
  if (!val || isCreate) return
  stored.value = val
  isActive.value = val.is_active
  setValues({
    email: val.email,
    app_password: '',
    provider: val.provider,
    host: val.host,
    port: val.port,
    sender_name: val.sender_name || '',
    branch: val.branch || '',
    secret: '',
    quota: val.quota,
    available_today: val.available_today,
    is_active: val.is_active,
  })
  ready.value = true
})

const handleSubmitForm = handleSubmit(async (values) => {
  if (isCreate && !values.app_password?.trim()) {
    toast.error('App password wajib diisi')
    return
  }
  const input = {
    email: values.email,
    // empty password/secret on update keeps the stored value
    app_password: values.app_password?.trim() || null,
    provider: values.provider,
    host: values.host,
    port: Number(values.port),
    sender_name: values.sender_name?.trim() || '',
    branch: values.branch?.trim() || '',
    secret: values.secret?.trim() || null,
    quota: Number(values.quota),
    available_today: values.available_today ?? null,
    is_active: Boolean(values.is_active),
  }
  try {
    if (isCreate) {
      await createSmtp(input)
      toast.success('SMTP berhasil ditambahkan')
    } else {
      await updateSmtp(id, input)
      toast.success('SMTP berhasil diperbarui')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (e: any) {
    toast.error(e?.message || 'Gagal menyimpan SMTP')
  }
}, notifyFormValidationError)

const handleBack = () => router.push(getPathWithoutIdInForm(currentPath))
</script>

<template>
  <div v-if="!isCreate && loading" class="py-4 text-center">Loading...</div>
  <div v-else-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
  <form v-else-if="ready" class="editor-form" @submit.prevent="handleSubmitForm">
    <FormsFormSection title="Akun email" description="Alamat pengirim dan kredensial SMTP.">
      <div class="form-grid">
        <FieldXText name="email" label="Email" placeholder="noreply@brandingku.my.id" :disabled="disabled" :isFieldDirty="isFieldDirty('email')" />
        <FieldXText name="sender_name" label="Sender name" placeholder="Brandingku" :disabled="disabled" :isFieldDirty="isFieldDirty('sender_name')" />
        <div>
          <FieldXText
            name="app_password"
            label="App password"
            type="password"
            :placeholder="isCreate ? 'App password dari provider' : 'Kosongkan untuk tetap memakai password lama'"
            :disabled="disabled"
            :isFieldDirty="isFieldDirty('app_password')"
          />
          <p v-if="!isCreate && stored?.has_app_password" class="mt-1 text-xs text-muted-foreground">Password tersimpan terenkripsi dan tidak ditampilkan.</p>
        </div>
        <div>
          <FieldXText
            name="secret"
            label="Secret (opsional)"
            type="password"
            :placeholder="stored?.has_secret ? 'Kosongkan untuk tetap memakai secret lama' : 'Opsional'"
            :disabled="disabled"
            :isFieldDirty="isFieldDirty('secret')"
          />
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Server" description="Untuk Gmail gunakan smtp.gmail.com port 587 dan App Password akun Google.">
      <div class="form-grid">
        <FieldXText name="provider" label="Provider" placeholder="gmail" :disabled="disabled" :isFieldDirty="isFieldDirty('provider')" />
        <FieldXText name="branch" label="Branch (opsional)" placeholder="mis. JKT" :disabled="disabled" :isFieldDirty="isFieldDirty('branch')" />
        <FieldXText name="host" label="Host" placeholder="smtp.gmail.com" :disabled="disabled" :isFieldDirty="isFieldDirty('host')" />
        <FieldXText name="port" label="Port" type="number" placeholder="587" :disabled="disabled" :isFieldDirty="isFieldDirty('port')" />
      </div>
    </FormsFormSection>

    <FormsFormSection title="Kuota & status" description="Kuota harian direset otomatis setiap hari saat email pertama dikirim.">
      <div class="form-grid">
        <FieldXText name="quota" label="Quota per hari" type="number" placeholder="500" :disabled="disabled" :isFieldDirty="isFieldDirty('quota')" />
        <FieldXText
          v-if="!isCreate"
          name="available_today"
          label="Sisa kuota hari ini"
          type="number"
          :disabled="disabled"
          :isFieldDirty="isFieldDirty('available_today')"
        />
        <FieldXCheckbox name="is_active" label="Aktif" v-model="isActive" :disabled="disabled" :isFieldDirty="isFieldDirty('is_active')" />
      </div>
      <p v-if="stored?.quota_date" class="text-xs text-muted-foreground">Kuota terakhir direset: {{ stored.quota_date }}</p>
    </FormsFormSection>

    <FormButton :handleBack="handleBack" />
  </form>
</template>
