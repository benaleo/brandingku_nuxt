<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useFormValues } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const router = useRouter()
const { updatePassword, loading, resetToken } = useResetPassword()

onMounted(() => {
  if (!resetToken.value) {
    router.replace('/console/auth/reset-password')
  }
})

const formSchema = toTypedSchema(z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}))

const { isFieldDirty, handleSubmit } = useForm({ validationSchema: formSchema })
const formValues = useFormValues<{ newPassword: string; confirmPassword: string }>()

const newPassword = computed(() => formValues.value.newPassword || '')
const confirmPassword = computed(() => formValues.value.confirmPassword || '')
const passwordsMatch = computed(
  () => newPassword.value.length >= 8 && newPassword.value === confirmPassword.value
)

const onSubmit = handleSubmit(async (values) => {
  try {
    await updatePassword(values.newPassword)
    toast.success('Password updated', { description: 'You can now log in with your new password' })
    router.push('/console/auth')
  } catch (err: any) {
    const msg = err.message?.replace('[GQL] Request failed: [GQL] Request failed: ', '').replace('[GQL] Request failed: ', '') || 'Failed to update password'
    toast.error('Error', { description: msg })
  }
})
</script>

<template>
  <div class="w-full h-screen flex justify-center items-start bg-green-400 pt-[20vh]">
    <div class="w-full px-4 md:px-0 md:max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p class="text-sm text-gray-500">Choose a strong password for your account</p>
        </div>

        <form class="space-y-5" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="newPassword" :validate-on-blur="!isFieldDirty">
            <FormItem v-auto-animate>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Min. 8 characters" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword" :validate-on-blur="!isFieldDirty">
            <FormItem v-auto-animate>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Repeat your password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div v-if="newPassword.length >= 8 && confirmPassword.length >= 8" class="flex items-center gap-2 text-sm">
            <span v-if="passwordsMatch" class="text-green-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Passwords match
            </span>
            <span v-else class="text-red-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Passwords do not match
            </span>
          </div>

          <Button class="w-full" type="submit" :disabled="!passwordsMatch || loading">
            {{ loading ? 'Updating...' : 'Update Password' }}
          </Button>
        </form>

        <p class="text-center text-sm text-gray-500">
          <NuxtLink to="/console/auth" class="text-blue-500 hover:underline">Back to login</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
