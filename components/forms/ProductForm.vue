<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { Check, ChevronsUpDown, ImageUp, Search } from 'lucide-vue-next'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch } from 'vue'
import { toast } from "vue-sonner";
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import { useProductService } from "~/services/product.service";
import { useOptionsService } from "~/services/options.service";
import type { OptionType } from "~/types/OptionType";
import ImageFormDialog from "~/components/forms/ImageFormDialog.vue";
import ImageUploadField from "~/components/forms/ImageUploadField.vue";
import FieldXCheckbox from "~/components/forms/FieldXCheckbox.vue";

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
  slug: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().int('Price must be an integer'),
  discount: z.coerce.number().int('Discount must be an integer'),
  discount_type: z.string().min(1, 'Discount type is required'),
  quantity: z.coerce.number().int('Quantity must be an integer'),
  highlight_image: z.string().nullable().optional(),
  highlight_description: z.string().nullable().optional(),
  is_highlight: z.coerce.boolean(),
  is_recommended: z.coerce.boolean(),
  is_upsell: z.coerce.boolean(),
  category_id: z.string().min(1, 'Category is required'),
}))

const {
  isFieldDirty,
  handleSubmit,
  setFieldValue,
  values
} = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    slug: '',
    description: '',
    price: 0,
    discount: 0,
    discount_type: '',
    quantity: 0,
    highlight_image: '',
    highlight_description: '',
    is_highlight: false,
    is_recommended: false,
    is_upsell: false,
    category_id: '',
  }
})

const name = ref('')
const slug = ref('')
const description = ref('')
const price = ref(0)
const discount = ref(0)
const discount_type = ref('')
const quantity = ref(0)
const highlight_image = ref('')
const highlight_image_file = ref<File | null>(null)
const highlight_description = ref('')
const is_highlight = ref(false)
const is_recommended = ref(false)
const is_upsell = ref(false)
const category_id = ref('')
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

// Fetch product categories
const {
  datas: categories,
  loading: categoryLoading,
  error: errorCategory,
  reFetch: reFetchCategories
} = useOptionsService()

const dtypes = ref<OptionType[]>([]) as Ref<OptionType[]>
useOptionsService().fetchDiscountTypes().then((val) => {
  dtypes.value = val
})

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
      highlight_image.value = datasVal.highlight_image || ''
      highlight_description.value = datasVal.highlight_description || ''
      is_highlight.value = Boolean(datasVal.is_highlight) || false
      is_recommended.value = Boolean(datasVal.is_recommended) || false
      is_upsell.value = Boolean(datasVal.is_upsell) || false
      category_id.value = datasVal.category_id || ''

      // Update form values for validation
      setFieldValue('name', datasVal.name || '')
      setFieldValue('slug', datasVal.slug || '')
      setFieldValue('description', datasVal.description || '')
      setFieldValue('price', datasVal.price || 0)
      setFieldValue('discount', datasVal.discount || 0)
      setFieldValue('discount_type', datasVal.discount_type || '')
      setFieldValue('quantity', datasVal.quantity || 0)
      setFieldValue('highlight_image', datasVal.highlight_image || '')
      setFieldValue('highlight_description', datasVal.highlight_description || '')
      setFieldValue('is_highlight', Boolean(datasVal.is_highlight) || false)
      setFieldValue('is_recommended', Boolean(datasVal.is_recommended) || false)
      setFieldValue('is_upsell', Boolean(datasVal.is_upsell) || false)
      setFieldValue('category_id', datasVal.category_id || '')

      isApiUpdate = false
    }
  },
  { immediate: true }
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
    // Ensure boolean values are properly converted
    values.is_recommended = Boolean(values.is_recommended);
    values.is_upsell = Boolean(values.is_upsell);

    // If highlight is required, handle upload if needed
    if (values.is_highlight) {
      // If a file is selected but no url yet, upload it
      if (highlight_image_file.value && !values.highlight_image) {
        const { uploadFile, getFileUrl } = useFileUpload();
        const file = highlight_image_file.value;
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `images-${Date.now()}.${fileExtension}`;
        const uploadResult = await uploadFile('images', uniqueFileName, file);
        if (!uploadResult) {
          toast.error('Image upload failed');
          return;
        }
        const url = await getFileUrl('images', uploadResult.path);
        if (!url) {
          toast.error('Failed to get image URL');
          return;
        }
        values.highlight_image = url;
        highlight_image.value = url;
      }
      if (!values.highlight_image) {
        toast.error('Please select an image for highlight.');
        return;
      }
    }
    // --- PLACEHOLDER: Insert your custom logic here if needed ---
    // console.log('Highlight image URL:', values.highlight_image);

    console.log(values)
    if (isCreate) {
      await useProductService().createProduct(values)
      toast.success('Product created successfully!')
    } else {
      await useProductService().updateProductById(id, values)
      toast.success('Product updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to save product')
    console.error(error)
  }
})

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}
</script>

<template>

  <form class="w-full space-y-6 flex flex-wrap" @submit.prevent="handleSubmitForm">
    <div class="pb-4 flex items-end w-full">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /product/
      </p>
      <!-- Slug -->
      <FormField v-slot="{ componentField }" name="slug" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate class="inline-flex">
          <FormControl>
            <Input class="h-6 text-sm font-bold italic focus-visible:border-0 focus-visible:ring-0" type="text"
              placeholder="Enter slug (optional)" v-model="slug" v-bind="componentField" :value="slug"
              :disabled="disabled" />
          </FormControl>
          <FormMessage class="inline-flex text-sm font-bold italic whitespace-nowrap items-end" />
        </FormItem>
      </FormField>
    </div>
    <!-- Name -->
    <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full" v-auto-animate>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Enter name" v-model="name" v-bind="componentField" :value="name" :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Description -->
    <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full" v-auto-animate>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Enter description" v-bind="componentField" :disabled v-model="description" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Price -->
    <FormField v-slot="{ componentField }" name="price" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Price</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter price" v-model="price" :value="price" v-bind="componentField"
            :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Quantity -->
    <FormField v-slot="{ componentField }" name="quantity" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Quantity</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter quantity" v-model="quantity" :value="quantity" v-bind="componentField"
            :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Discount -->
    <FormField v-slot="{ componentField }" name="discount" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Discount</FormLabel>
        <FormControl>
          <Input type="number" placeholder="Enter discount" v-model="discount" :value="discount || 0"
            v-bind="componentField" :disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Discount Type -->
    <FormField v-slot="{ componentField }" name="discount_type" :validate-on-blur="!isFieldDirty">
      <FormItem v-auto-animate class="w-full md:w-1/2">
        <FormLabel>Discount Type</FormLabel>
        <Select v-bind="componentField" v-model="discount_type" :disabled>
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="type in (dtypes || [])" :key="type.id" :value="type.id" :disabled>
                {{ type.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Product Categories -->
    <FormField v-slot="{ componentField }" name="category_id" :validate-on-blur="!isFieldDirty">
      <FormItem class="w-full md:w-1/2" v-auto-animate>
        <FormLabel>Kategori</FormLabel>
        <FormControl>
          <Combobox v-model="category_id" by="id" v-bind="componentField">
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child :disabled="disabled">
                <Button variant="outline" class="justify-between w-full">
                  {{(categories ?? []).find(cat => cat.id === category_id)?.label ?? 'Select category'}}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>

            <ComboboxList>
              <div class="relative w-full items-center">
                <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10"
                  placeholder="Search category..." />
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>

              <ComboboxEmpty>
                No category found.
              </ComboboxEmpty>

              <ComboboxGroup>
                <template v-if="categoryLoading">
                  <div class="px-4 py-2 text-gray-500">Loading categories...</div>
                </template>
                <template v-else-if="errorCategory">
                  <div class="px-4 py-2 text-red-500">Failed to load categories</div>
                </template>
                <template v-else>
                  <ComboboxItem v-for="category in (categories ?? [])" :key="category.id" :value="category.id">
                    {{ category.label }}
                    <ComboboxItemIndicator>
                      <Check class="ml-auto h-4 w-4" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </template>
              </ComboboxGroup>
            </ComboboxList>
          </Combobox>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Is Highlight -->
    <FieldXCheckbox
      name="is_highlight"
      label="Is Highlight"
      v-model="is_highlight"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_highlight')"
    />

    <!-- Additional if Is Highlight true   -->
    <Card class="w-full" v-if="is_highlight">
      <CardContent class="grid gap-2">
        <!-- Highlight Image -->
        <ImageUploadField v-model:fileUrl="highlight_image" v-model:file="highlight_image_file" label="Highlight Image"
          :disabled="disabled" />
        <!-- Highlight Description -->
        <FormField v-slot="{ componentField }" name="highlight_description" :validate-on-blur="!isFieldDirty">
          <FormItem class="w-full" v-auto-animate>
            <FormLabel>Highlight Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter highlight description" v-bind="componentField" :disabled="disabled"
                v-model="highlight_description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </CardContent>
    </Card>
    <!-- Is Recommended -->
    <FieldXCheckbox
      name="is_recommended"
      label="Is Recommended"
      v-model="is_recommended"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_recommended')"
      itemClass="flex items-center gap-2 justify-start w-full"
    />
    <!-- Is Upsell -->
    <FieldXCheckbox
      name="is_upsell"
      label="Is Upsell"
      v-model="is_upsell"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_upsell')"
      itemClass="flex items-center gap-2 justify-start w-full"
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