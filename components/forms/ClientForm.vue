<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, onMounted, computed } from 'vue'
import { toast } from "vue-sonner";
import { useClientService } from '~/services/client.service'
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FormButton from "~/components/atoms/FormButton.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import type { Client, ClientRequest } from '~/types/client.type';
import { useFileToBase64 } from '~/composables/useFileToBase64'

const router = useRouter()
const props = defineProps<{
  editId?: number | null
  detail?: Client | null
}>()
const currentPath = router.currentRoute.value.path
const idFromPath = getIdFromPath(router.currentRoute.value.path)
const resolvedEditId = computed(() => props.editId ?? idFromPath)
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

const service = useClientService()
const { detail, loadDetail, createClient, updateClient } = service

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().optional().default(''),
  orders: z.coerce.number().min(0, 'Orders must be a positive number'),
  is_active: z.coerce.boolean(),
}))

const { isFieldDirty, setFieldValue, handleSubmit } = useForm<ClientRequest>({
  validationSchema: formSchema,
})

const name = ref('')
const logo = ref('')
const orders = ref(0)
const is_active = ref(false)

const image = ref('') // preview url
const imageFile = ref<File | null>(null)

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

const setFieldsFromDetail = (val: Client) => {
  isApiUpdate = true
  name.value = val.name || ''
  logo.value = val.logo || ''
  orders.value = val.orders || 0
  is_active.value = Boolean(val.is_active) || false

  image.value = val.logo ? STORAGE_URL + val.logo : ''

  // Update form values
  setFieldValue('name', name.value)
  setFieldValue('logo', logo.value)
  setFieldValue('orders', orders.value)
  setFieldValue('is_active', is_active.value)
  isApiUpdate = false
}

// Load detail on mount for edit/detail pages
onMounted(async () => {
  if (props.detail) {
    detail.value = props.detail
    setFieldsFromDetail(props.detail)
  } else if (!isCreate && resolvedEditId.value) {
    try {
      await loadDetail(Number(resolvedEditId.value))
    } catch (e) {
      console.error('Failed to load client detail', e)
    }
  }
})

const onImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    image.value = URL.createObjectURL(imageFile.value)
  }
}

const handleSubmitForm = handleSubmit(async (values: ClientRequest) => {
  try {
    const payload: ClientRequest = {
      name: values.name,
      logo: values.logo || logo.value,
      orders: Number(values.orders) || 0,
      is_active: Boolean(values.is_active),
    }

    // handle logo file -> base64
    if (imageFile.value) {
      const { convertToBase64 } = useFileToBase64()
      payload.logo = await convertToBase64(imageFile.value)
      // debug
      if (payload.logo) {
        console.log('[client] logo base64 prefix:', payload.logo.substring(0, 30))
        console.log('[client] logo base64 length:', payload.logo.length)
      }
    }

    if (isCreate) {
      await createClient({
        name: payload.name,
        logo: payload.logo || '',
        orders: payload.orders,
        is_active: payload.is_active,
      })
      toast.success('Client created successfully!')
    } else if (resolvedEditId.value) {
      await updateClient({
        id: Number(resolvedEditId.value),
        name: payload.name,
        logo: payload.logo, // optional
        orders: payload.orders,
        is_active: payload.is_active,
      })
      toast.success('Client updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to submit client form')
    console.error(error)
  }
})

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}

useHead({
    title: computed(() => {
        if (isCreate) {
            return 'Add Client'
        } else if (resolvedEditId.value) {
            return 'Edit Client'
        } else {
            return 'Client'
        }
    })
})
</script>

<template>
  <form class="w-full space-y-6" @submit.prevent="handleSubmitForm">
    <div class="grid md:grid-cols-2 gap-2">
    <!-- Name -->
    <FieldXText name="name" label="Name" placeholder="Enter name" v-model="name" :disabled="disabled"
      :isFieldDirty="isFieldDirty('name')" />

    <!-- Orders -->
    <FieldXText name="orders" label="Orders" placeholder="Enter orders" type="number" v-model="orders" :disabled="disabled"
      :isFieldDirty="isFieldDirty('orders')" />
    </div>

    <!-- Logo -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Logo</label>
      <input type="file" @change="onImageChange" accept="image/*" :disabled="disabled" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      <img v-if="image" :src="image" alt="Preview" class="max-w-xs max-h-32 object-cover" />
    </div>
    

    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')" />


    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>