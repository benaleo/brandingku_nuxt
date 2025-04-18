<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {vAutoAnimate} from '@formkit/auto-animate/vue'

import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import * as z from 'zod'
import {ref, watch} from 'vue'
import {toast} from "vue-sonner";
import {useProductCategoryService} from '~/services/product-category.service'
import {getPathWithoutAdd} from "~/utils/global.utils";

const productCategoryService = useProductCategoryService()
const router = useRouter()

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

const updateSlugFromName = (nameValue : string) => {
  console.log('Input value:', nameValue)
  const newSlug = nameValue
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  console.log('Transformed slug:', newSlug)
  slug.value = newSlug
  console.log('Current slug ref:', slug.value)
}

watch(name, (newVal) => {
  updateSlugFromName(newVal)
})

const handleSubmitForm = handleSubmit(async (values) => {
  try {
    console.log(values)
    await productCategoryService.createProductCategory(values)
    router.push(getPathWithoutAdd(router.currentRoute.value.path))
    toast.success('Product category created successfully!')
  } catch (error) {
    toast.error('Failed to create product category')
    console.error(error)
  }
})
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
          <Input type="text" placeholder="Enter slug" v-model="slug" v-bind="componentField" :value="slug"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Enter description" v-bind="componentField"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <Button type="submit">
      Submit
    </Button>
  </form>
</template>