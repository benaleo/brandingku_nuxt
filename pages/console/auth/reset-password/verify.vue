<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const { verifyOtp, loading } = useResetPassword()

const email = computed(() => (route.query.email as string) || '')
const digits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

const otp = computed(() => digits.value.join(''))
const isComplete = computed(() => otp.value.length === 6 && /^\d{6}$/.test(otp.value))

onMounted(() => {
  if (!email.value) {
    router.replace('/console/auth/reset-password')
  }
})

const onDigitInput = (index: number, event: Event) => {
  const el = event.target as HTMLInputElement
  const val = el.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = val
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

const onKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || ''
  pasted.split('').forEach((ch, i) => { digits.value[i] = ch })
  const nextEmpty = pasted.length < 6 ? pasted.length : 5
  inputRefs.value[nextEmpty]?.focus()
}

const onSubmit = async () => {
  if (!isComplete.value) return
  try {
    await verifyOtp(email.value, otp.value)
    toast.success('OTP verified', { description: 'You can now set a new password' })
    router.push('/console/auth/reset-password/change-password')
  } catch (err: any) {
    const msg = err.message?.replace('[GQL] Request failed: [GQL] Request failed: ', '').replace('[GQL] Request failed: ', '') || 'Invalid OTP'
    toast.error('Verification failed', { description: msg })
    digits.value = ['', '', '', '', '', '']
    nextTick(() => inputRefs.value[0]?.focus())
  }
}
</script>

<template>
  <div class="w-full h-screen flex justify-center items-start bg-green-400 pt-[20vh]">
    <div class="w-full px-4 md:px-0 md:max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
          <p class="text-sm text-gray-500">
            We sent a 6-digit code to <span class="font-medium text-gray-700">{{ email }}</span>
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="onSubmit">
          <div class="flex gap-3 justify-center" @paste="onPaste">
            <input
              v-for="(_, i) in digits"
              :key="i"
              :ref="(el) => { if (el) inputRefs[i] = el as HTMLInputElement }"
              v-model="digits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors
                     border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200
                     disabled:opacity-50"
              :disabled="loading"
              @input="onDigitInput(i, $event)"
              @keydown="onKeydown(i, $event)"
            />
          </div>

          <Button class="w-full" type="submit" :disabled="!isComplete || loading">
            {{ loading ? 'Verifying...' : 'Verify Code' }}
          </Button>
        </form>

        <div class="flex justify-between text-sm text-gray-500">
          <NuxtLink to="/console/auth/reset-password" class="text-blue-500 hover:underline">
            Change email
          </NuxtLink>
          <NuxtLink to="/console/auth" class="hover:underline">
            Back to login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
