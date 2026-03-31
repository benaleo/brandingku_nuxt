<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, onMounted, computed } from 'vue'
import { toast } from "vue-sonner";
import { useTestimonialService } from '~/services/testimonial.service'
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FormButton from "~/components/atoms/FormButton.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import type { Testimonial, TestimonialRequest } from '~/types/testimonial.type';

const router = useRouter()
const props = defineProps<{
  editId?: number | null
  detail?: Testimonial | null
}>()
const currentPath = router.currentRoute.value.path
const idFromPath = getIdFromPath(router.currentRoute.value.path)
const resolvedEditId = computed(() => props.editId ?? idFromPath)

const service = useTestimonialService()
const { detail, loadDetail, createTestimonial, updateTestimonial } = service

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  job: z.string().min(1, 'Job is required'),
  content: z.string().min(1, 'Content is required'),
  rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  orders: z.coerce.number().min(0, 'Orders must be a positive number'),
  is_active: z.coerce.boolean(),
}))

const { isFieldDirty, setFieldValue, handleSubmit, values } = useForm<TestimonialRequest>({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    job: '',
    content: '',
    rating: 5,
    orders: 0,
    is_active: true,
  }
})

const name = ref('')
const job = ref('')
const content = ref('')
const rating = ref(5)
const orders = ref(0)
const is_active = ref(true)

// Watch local refs and update form values
watch([name, job, content, rating, orders, is_active], () => {
  if (!isApiUpdate) {
    setFieldValue('name', name.value)
    setFieldValue('job', job.value)
    setFieldValue('content', content.value)
    setFieldValue('rating', rating.value)
    setFieldValue('orders', orders.value)
    setFieldValue('is_active', is_active.value)
  }
}, { deep: true })

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

const setFieldsFromDetail = (val: Testimonial) => {
  isApiUpdate = true
  name.value = val.name || ''
  job.value = val.job || ''
  content.value = val.content || ''
  rating.value = val.rating || 5
  orders.value = val.orders || 0
  is_active.value = Boolean(val.is_active) || false
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
      if (detail.value) {
        setFieldsFromDetail(detail.value)
      }
    } catch (e) {
      console.error('Failed to load testimonial detail', e)
    }
  }
})

const handleSubmitForm = handleSubmit(async (values: TestimonialRequest) => {
  try {
    console.log('Form values submitted:', values)
    
    const payload: TestimonialRequest = {
      name: values.name,
      job: values.job,
      content: values.content,
      rating: Number(values.rating) || 5,
      orders: Number(values.orders) || 0,
      is_active: Boolean(values.is_active),
    }
    
    console.log('Payload to send:', payload)

    if (isCreate) {
      await createTestimonial({
        name: payload.name,
        job: payload.job,
        content: payload.content,
        rating: payload.rating,
        orders: payload.orders,
        is_active: payload.is_active,
      })
      toast.success('Testimonial created successfully!')
    } else if (resolvedEditId.value) {
      await updateTestimonial({
        id: Number(resolvedEditId.value),
        name: payload.name,
        job: payload.job,
        content: payload.content,
        rating: payload.rating,
        orders: payload.orders,
        is_active: payload.is_active,
      })
      toast.success('Testimonial updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to submit testimonial form')
    console.error('Submit error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  }
})

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}

useHead({
    title: computed(() => {
        if (isCreate) {
            return 'Add Testimonial'
        } else if (resolvedEditId.value) {
            return 'Edit Testimonial'
        } else {
            return 'Testimonial'
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

    <!-- Job -->
    <FieldXText name="job" label="Job" placeholder="Enter job" v-model="job" :disabled="disabled"
      :isFieldDirty="isFieldDirty('job')" />
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Content</label>
      <textarea 
        name="content" 
        v-model="content" 
        :disabled="disabled"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter testimonial content"
      ></textarea>
    </div>

    <div class="grid md:grid-cols-2 gap-2">
    <!-- Rating -->
    <FieldXText name="rating" label="Rating (1-5)" placeholder="Enter rating" type="number" min="1" max="5" v-model="rating" :disabled="disabled"
      :isFieldDirty="isFieldDirty('rating')" />

    <!-- Orders -->
    <FieldXText name="orders" label="Orders" placeholder="Enter orders" type="number" v-model="orders" :disabled="disabled"
      :isFieldDirty="isFieldDirty('orders')" />
    </div>
    
    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')" />

    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>
