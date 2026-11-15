<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CustomerAddress, CustomerAddressInput } from '~/types/customer.type'

// add or edit one saved address; the parent owns the API call and closes the dialog on success
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  address?: CustomerAddress | null
  busy?: boolean
}>()
const emit = defineEmits<{ save: [input: CustomerAddressInput] }>()

const form = reactive({ label: '', recipient_name: '', phone: '', address: '', city: '', postal_code: '' })
const errors = ref<Record<string, string>>({})

watch(open, (value) => {
  if (!value) return
  const a = props.address
  form.label = a?.label || ''
  form.recipient_name = a?.recipient_name || ''
  form.phone = a?.phone || ''
  form.address = a?.address || ''
  form.city = a?.city || ''
  form.postal_code = a?.postal_code || ''
  errors.value = {}
})

const onOpenChange = (value: boolean) => {
  if (!value && props.busy) return
  open.value = value
}

const submit = () => {
  if (props.busy) return
  const next: Record<string, string> = {}
  if (!form.recipient_name.trim()) next.recipient_name = 'Nama penerima wajib diisi.'
  if (!form.phone.trim()) next.phone = 'Telepon penerima wajib diisi.'
  if (!form.address.trim()) next.address = 'Alamat wajib diisi.'
  if (!form.city.trim()) next.city = 'Kota wajib diisi.'
  errors.value = next
  if (Object.keys(next).length) return
  emit('save', {
    label: form.label.trim() || undefined,
    recipient_name: form.recipient_name.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    postal_code: form.postal_code.trim() || undefined,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ address ? 'Ubah alamat' : 'Tambah alamat' }}</DialogTitle>
        <DialogDescription>Alamat disimpan di buku alamat customer dan langsung dipakai untuk order ini.</DialogDescription>
      </DialogHeader>
      <form class="space-y-3" novalidate @submit.prevent="submit">
        <div>
          <Label for="addr-label" class="text-xs">Label (opsional)</Label>
          <Input id="addr-label" v-model="form.label" maxlength="50" class="mt-1 max-sm:h-11" placeholder="mis. Kantor atau Rumah"/>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <Label for="addr-name" class="text-xs">Nama penerima *</Label>
            <Input id="addr-name" v-model="form.recipient_name" maxlength="150" autocomplete="name" class="mt-1 max-sm:h-11" :aria-invalid="!!errors.recipient_name"/>
            <p v-if="errors.recipient_name" class="mt-1 text-xs text-red-600">{{ errors.recipient_name }}</p>
          </div>
          <div>
            <Label for="addr-phone" class="text-xs">Telepon penerima *</Label>
            <Input id="addr-phone" v-model="form.phone" maxlength="40" type="tel" inputmode="tel" autocomplete="tel" class="mt-1 max-sm:h-11" :aria-invalid="!!errors.phone"/>
            <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
          </div>
        </div>
        <div>
          <Label for="addr-address" class="text-xs">Alamat *</Label>
          <Textarea id="addr-address" v-model="form.address" rows="3" maxlength="500" class="mt-1" :aria-invalid="!!errors.address"/>
          <p v-if="errors.address" class="mt-1 text-xs text-red-600">{{ errors.address }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <Label for="addr-city" class="text-xs">Kota *</Label>
            <Input id="addr-city" v-model="form.city" maxlength="100" class="mt-1 max-sm:h-11" :aria-invalid="!!errors.city"/>
            <p v-if="errors.city" class="mt-1 text-xs text-red-600">{{ errors.city }}</p>
          </div>
          <div>
            <Label for="addr-postal" class="text-xs">Kode pos</Label>
            <Input id="addr-postal" v-model="form.postal_code" maxlength="10" inputmode="numeric" autocomplete="postal-code" class="mt-1 max-sm:h-11"/>
          </div>
        </div>
        <DialogFooter class="pt-2">
          <Button type="button" variant="outline" class="max-sm:h-11" :disabled="busy" @click="onOpenChange(false)">Batal</Button>
          <Button type="submit" variant="primary" class="max-sm:h-11" :disabled="busy">
            <Loader2 v-if="busy" class="mr-1 size-4 animate-spin"/> Simpan
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
