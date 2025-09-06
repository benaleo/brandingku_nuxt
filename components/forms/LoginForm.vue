<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {vAutoAnimate} from '@formkit/auto-animate/vue'

import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import * as z from 'zod'
import {toast} from "vue-sonner";
import { useAuthService } from '~/services/auth.service';
import { useRouter } from 'vue-router';
import { useCookie } from '#app';

const router = useRouter();
const tokenCookie = useCookie('token');
const authService = useAuthService();

const formSchema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string().min(8),
}))

const {isFieldDirty, handleSubmit} = useForm({
  validationSchema: formSchema,
})

const handleLogin = handleSubmit(async (values) => {
  try {
    const { token } = await authService.login(values.email, values.password);
    tokenCookie.value = token;
    router.push('/console/secret/dashboard');
    toast.success('Login successful', {
      description: 'You are now logged in',
    })
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Please check your email and password';
    toast.error('Login failed', {
      description: errorMessage,
    })
  }
})

</script>

<template>
  <form class="w-full space-y-6 px-6 py-4" @submit.prevent="handleLogin">
    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="user@example.com" v-bind="componentField"/>
        </FormControl>
        <FormDescription>
          Your email address.
        </FormDescription>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="password" v-bind="componentField"/>
        </FormControl>
        <FormDescription>
          Your password.
        </FormDescription>
        <FormMessage/>
      </FormItem>
    </FormField>
    <Button class="w-full" type="submit">
      Login
    </Button>
  </form>
</template>