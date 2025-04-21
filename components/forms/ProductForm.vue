<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {vAutoAnimate} from '@formkit/auto-animate/vue'

import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import * as z from 'zod'
import {ref, watch} from 'vue'
import {toast} from "vue-sonner";
import {getIdFromPath, getPathWithoutIdInForm} from "~/utils/global.utils";
import {useRouter} from 'vue-router'
import {useProductService} from "~/services/product.service";

const router = useRouter()
const currentPath = router.currentRoute.value.path
const id = getIdFromPath(router.currentRoute.value.path)
const config = useRuntimeConfig()

const {
  datas,
  loading,
  error,
  reFetch
} = useProductService(false, id)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().int('Price must be an integer'),
  discount: z.coerce.number().int('Discount must be an integer'),
  discount_type: z.string().min(1, 'Discount type is required'),
  quantity: z.coerce.number().int('Quantity must be an integer'),
  is_recommended: z.boolean(),
  is_upsell: z.boolean(),
  category_id: z.string().min(1, 'Category is required'),
}))

const {isFieldDirty, handleSubmit} = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const slug = ref('')
const description = ref('')
const price = ref(0)
const discount = ref(0)
const discount_type = ref('')
const quantity = ref(0)
const is_recommended = ref(false)
const is_upsell = ref(false)
const category_id = ref('')
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

// Watch for API data load and set fields when available
watch(
    [loading, datas],
    ([loadingVal, datasVal]) => {
      if (!isCreate && !loadingVal && datasVal) {
        isApiUpdate = true
        name.value = datasVal.name || ''
        slug.value = datasVal.slug || ''
        description.value = datasVal.description || ''
        price.value = datasVal.price || 0
        discount.value = datasVal.discount || 0
        discount_type.value = datasVal.discount_type || ''
        quantity.value = datasVal.quantity || 0
        is_recommended.value = datasVal.is_recommended || false
        is_upsell.value = datasVal.is_upsell || false
        category_id.value = datasVal.category_id || ''
        isApiUpdate = false
      }
    },
    {immediate: true}
)

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
  if (!isApiUpdate) updateSlugFromName(newVal)
})

const handleSubmitForm = handleSubmit(async (values) => {
  try {
    console.log(values)
    if (isCreate) {
      await useProductService().createProduct(values)
      toast.success('Product category created successfully!')
    } else {
      await useProductService().updateProductById(id, values)
      toast.success('Product category updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to create product category')
    console.error(error)
  }
})

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}
</script>

<template>

  <form class="w-full space-y-6 flex flex-wrap" @submit.prevent="handleSubmitForm">
    <div class="pb-12 flex items-end w-full">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /
      </p>
      <FormField v-slot="{ componentField }" name="slug" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate class="inline-flex">
          <FormControl>
            <Input class="h-6 text-sm font-bold italic focus-visible:border-0 focus-visible:ring-0" type="text"
                   placeholder="Enter slug" v-model="slug" v-bind="componentField" :value="slug" :disabled/>
          </FormControl>
          <FormMessage class="inline-flex text-sm font-bold italic whitespace-nowrap items-end"/>
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full" v-auto-animate>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter name" v-model="name" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full" v-auto-animate>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Enter description" v-bind="componentField" :disabled v-model="description"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="price" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Price</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter price" v-model="price" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="quantity" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Quantity</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter quantity" v-model="quantity" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="discount" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Discount</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter discount" v-model="discount" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="discount_type" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate class="w-full md:w-1/2">
        <FormLabel>Discount Type</FormLabel>

        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select discount type"/>
            </SelectTrigger>
          </FormControl>
          <SelectContent class="w-full md:w-1/2">
            <SelectGroup>
              <SelectItem value="PERCENTAGE">
                Percentage (%)
              </SelectItem>
              <SelectItem value="AMOUNT">
                Amount
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormMessage/>
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="category_id" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Kategori</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter category id" v-model="category_id" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="is_recommended" :validate-on-blur="!isFieldDirty">
      <FormItem class="flex items-center gap-2 justify-start w-full" v-auto-animate>
        <FormLabel>Is Recommended</FormLabel>
        <FormControl>
          <input type="checkbox" v-model="is_recommended" v-bind="componentField" :disabled/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="is_upsell" :validate-on-blur="!isFieldDirty">
      <FormItem class="flex items-center gap-2 justify-start w-full" v-auto-animate>
        <FormLabel>Is Upsell</FormLabel>
        <FormControl>
          <input type="checkbox" v-model="is_upsell" v-bind="componentField" :disabled/>
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