<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const router = useRouter()
const { requestOtp, loading } = useResetPassword()

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email address'),
}))

const { isFieldDirty, handleSubmit } = useForm({ validationSchema: formSchema })

const onSubmit = handleSubmit(async (values) => {
  try {
    await requestOtp(values.email)
    toast.success('OTP sent', { description: 'Check your email for the verification code' })
    router.push({ path: '/console/auth/reset-password/verify', query: { email: values.email } })
  } catch (err: any) {
    const msg = err.message?.replace('[GQL] Request failed: [GQL] Request failed: ', '').replace('[GQL] Request failed: ', '') || 'Failed to send OTP'
    toast.error('Error', { description: msg })
  }
})
</script>

<template>
  <div class="w-full h-screen flex justify-center items-start bg-green-400 pt-[20vh]">
    <div class="w-full px-4 md:px-0 md:max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p class="text-sm text-gray-500">Enter your email to receive a verification code</p>
        </div>

        <form class="space-y-5" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
            <FormItem v-auto-animate>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button class="w-full" type="submit" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Verification Code' }}
          </Button>
        </form>

        <p class="text-center text-sm text-gray-500">
          Remember your password?
          <NuxtLink to="/console/auth" class="text-blue-500 hover:underline">Back to login</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
