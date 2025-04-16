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
import { h } from 'vue'
import * as z from 'zod'
import {toast} from "vue-sonner";
import authService from '~/services/auth.service';
import { useRouter } from 'vue-router';
import { useCookie } from '#app';

const router = useRouter();
const tokenCookie = useCookie('token');

const formSchema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string().min(8),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const handleLogin = handleSubmit(async (values) => {
  try {
    const response = await authService.login(values.email, values.password);
    tokenCookie.value = response.data.token;
    console.log('Token:', response.data.token);
    router.push('/console/secret/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
})

const onSubmit = handleSubmit((values) => {
  toast.success({
    title: 'You submitted the following values:',
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
})
</script>

<template>
  <form class="w-full space-y-6" @submit.prevent="handleLogin">
    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="user@example.com" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Your email address.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="password" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Your password.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit">
      Login
    </Button>
  </form>
</template>