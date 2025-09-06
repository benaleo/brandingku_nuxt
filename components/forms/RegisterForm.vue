<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useAuthService } from '~/services/auth.service'

const router = useRouter()
const authService = useAuthService()

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}))

const { isFieldDirty, handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values) => {
  try {
    await authService.register(values.name, values.email, values.password)
    toast.success('Registration successful', {
      description: 'You can now log in with your credentials',
    })
    router.push('/console/secret/dashboard')
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
    toast.error('Registration failed', {
      description: errorMessage,
    })
  }
})
</script>

<template>
  <form class="w-full space-y-6 px-6 py-4" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Full Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="John Doe" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Your full name as you'd like it to appear
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="you@example.com" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="••••••••" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          At least 8 characters with one uppercase letter and one number
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="confirmPassword" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Confirm Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="••••••••" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button class="w-full" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Creating account...' : 'Create account' }}
    </Button>
  </form>
</template>