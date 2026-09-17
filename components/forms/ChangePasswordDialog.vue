<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const emit = defineEmits<{ submit: [newPassword: string] }>()
defineProps<{ saving: boolean }>()
const open = defineModel<boolean>('open', { default: false })

const schema = toTypedSchema(z.object({
  newPassword: z.string().min(8, 'Password minimal 8 karakter').max(72),
  confirmPassword: z.string().min(8, 'Password minimal 8 karakter').max(72),
}).refine(v => v.newPassword === v.confirmPassword, { message: 'Konfirmasi password tidak cocok', path: ['confirmPassword'] }))
const { handleSubmit, resetForm } = useForm({ validationSchema: schema })

const submit = handleSubmit(values => {
  emit('submit', values.newPassword)
}, notifyFormValidationError)

watch(open, isOpen => { if (!isOpen) resetForm() })
defineExpose({ resetForm })
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger as-child>
      <UiButton type="button" variant="outline">Ganti password</UiButton>
    </UiDialogTrigger>
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>Ganti password</UiDialogTitle>
        <UiDialogDescription>Masukkan password baru dan konfirmasinya.</UiDialogDescription>
      </UiDialogHeader>
      <form class="space-y-4" @submit.prevent="submit">
        <fieldset :disabled="saving" class="space-y-4">
          <FormsFieldsFieldXText name="newPassword" type="password" label="Password baru" placeholder="Minimal 8 karakter" />
          <FormsFieldsFieldXText name="confirmPassword" type="password" label="Konfirmasi password baru" placeholder="Ulangi password baru" />
        </fieldset>
        <UiDialogFooter>
          <UiButton type="button" variant="outline" :disabled="saving" @click="open = false">Batal</UiButton>
          <UiButton type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan password' }}</UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
