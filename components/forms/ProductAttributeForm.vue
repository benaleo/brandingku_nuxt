<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch } from 'vue'
import { toast } from "vue-sonner";
import { useProductAttributeService } from '~/services/product-attribute.service'
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import FieldXCheckbox from './fields/FieldXCheckbox.vue'
import FieldXText from './fields/FieldXText.vue'
import FormButton from '../atoms/FormButton.vue'

const router = useRouter()
const currentPath = router.currentRoute.value.path
const id = getIdFromPath(router.currentRoute.value.path)
const {
  datas,
  loading,
  error,
  reFetch
} = useProductAttributeService(false, id)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),

  category: z.string().min(1, 'Category is required'),
  is_active: z.coerce.boolean()
}))

const { isFieldDirty, setFieldValue, handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    category: '',
    is_active: false
  }
})

const name = ref('')
const category = ref('')
const is_active = ref(false)
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

// Watch for API data load and set fields when available
watch(
  [loading, datas],
  ([loadingVal, datasVal]) => {
    if (!isCreate && !loadingVal && datasVal) {
      console.log('API data received:', datasVal)
      name.value = datasVal.name || ''
      category.value = datasVal.category || ''
      is_active.value = Boolean(datasVal.is_active) || false
      console.log('Component state after update - is_active:', is_active.value)


      setFieldValue('name', datasVal.name || '')
      setFieldValue('category', datasVal.category || '')
      setFieldValue('is_active', Boolean(datasVal.is_active) || false)
      
      isApiUpdate = false
    }
  },
  { immediate: true }
)

const handleSubmitForm = handleSubmit(async (values) => {
  try {
    console.log(values)
    if (isCreate) {
      await useProductAttributeService().createProductAttribute(values)
      toast.success('Product attribute created successfully!')
    } else {
      await useProductAttributeService().updateProductAttributeById(id, values)
      toast.success('Product attribute updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to create product attribute')
    console.error(error)
  }
})

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}

defineOptions({
  directives: {
    autoAnimate: vAutoAnimate
  }
})
</script>

<template>
  <form class="w-full space-y-6" @submit.prevent="handleSubmitForm">
    <!-- Name -->
    <FieldXText 
      name="name"
      label="Name"
      placeholder="Enter name"
      v-model="name"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('name')"
    />
    <!-- Category -->
    <FieldXText 
      name="category"
      label="Category"
      placeholder="Enter category"
      v-model="category"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('category')"
    />

    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled" :isFieldDirty="isFieldDirty('is_active')" />

    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>