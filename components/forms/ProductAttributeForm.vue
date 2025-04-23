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
import FieldXCheckbox from './FieldXCheckbox.vue'

const router = useRouter()
const currentPath = router.currentRoute.value.path
const id = getIdFromPath(router.currentRoute.value.path)
const {
  datas,
  loading,
  error,
  reFetch
} = useProductAttributeService(true, id)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  
  category: z.string().min(1, 'Category is required'),
  is_active: z.coerce.boolean()
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const category = ref('')
const is_active = ref(false)
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")

// Watch for API data load and set fields when available
watch(
  [loading, datas],
  ([loadingVal, datasVal]) => {
    if (!isCreate && !loadingVal && datasVal) {
      console.log('API data received:', datasVal)
      name.value = datasVal.name || ''
      category.value = datasVal.category || ''
      is_active.value = datasVal.is_active !== undefined ? datasVal.is_active : false
      console.log('Component state after update - is_active:', is_active.value)
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
</script>

<template>
  <form class="w-full space-y-6" @submit.prevent="handleSubmitForm">
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter name" v-model="name" v-bind="componentField" :value="name" :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="category" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Category</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter category" v-model="category" v-bind="componentField" :value="category"
            :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Is Active -->
    <FieldXCheckbox
      name="is_active"
      label="Is Active"
      v-model="is_active"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')"
    />

    <div class="w-full flex justify-end items-center gap-2">
      <Button variant="secondary" @click="handleBack" type="button">
        Batal
      </Button>
      <Button type="submit">
        Simpan
      </Button>
    </div>
  </form>
</template>