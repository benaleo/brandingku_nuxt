<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {vAutoAnimate} from '@formkit/auto-animate/vue'

import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import * as z from 'zod'
import {onMounted, ref, watch} from 'vue'
import {toast} from "vue-sonner";
import {useProductCategoryService} from '~/services/product-category.service'
import {getPathWithoutAdd, getPathWithoutIdViewAndEdit} from "~/utils/global.utils";
import {useRouter} from 'vue-router'

const productCategoryService = useProductCategoryService()
const router = useRouter()
const currentPath = router.currentRoute.value.path

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
}))

const {isFieldDirty, handleSubmit} = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const slug = ref('')
const description = ref('')
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")

// Fetch detail if isCreate and route has an id param
onMounted(async () => {
  if (!isCreate && router.currentRoute.value.params.id) {
    try {
      console.log("fetch detail")
      const { getProductCategoryById } = productCategoryService
      const detail = await getProductCategoryById(router.currentRoute.value.params.id as string)
      name.value = detail.name
      slug.value = detail.slug
      description.value = detail.description
    } catch (error) {
      toast.error('Failed to load product category detail')
    }
  }
})

const updateSlugFromName = (nameValue: string | undefined) => {
  if (!nameValue) {
    slug.value = ''
    return
  }
  slug.value = nameValue
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
}

watch(name, (newVal) => {
  updateSlugFromName(newVal)
})

const handleSubmitForm = handleSubmit(async (values) => {
  try {
    console.log(values)
    await productCategoryService.createProductCategory(values)
    router.push(getPathWithoutAdd(currentPath))
    toast.success('Product category created successfully!')
  } catch (error) {
    toast.error('Failed to create product category')
    console.error(error)
  }
})

const handleBack = () => {
  if (currentPath.includes("/detail") || currentPath.includes("/edit")) {
    router.push(getPathWithoutIdViewAndEdit(currentPath))
  } else {
    router.push(getPathWithoutAdd(currentPath))
  }
}
</script>

<template>
  <form class="w-full space-y-6" @submit.prevent="handleSubmitForm">
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Enter name"
            v-model="name"
            v-bind="componentField"
            :disabled
            @input="(e: any) => updateSlugFromName(e.target.value)"
          />
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="slug" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Slug</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter slug" v-model="slug" v-bind="componentField" :value="slug" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Enter description" v-bind="componentField" :disabled v-model="description"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
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