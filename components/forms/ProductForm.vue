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
import type { OptionType, ProductAttributeOptions } from "~/types/options.type";
import ImageFormDialog from "~/components/forms/ImageFormDialog.vue";
import ImageUploadField from "~/components/forms/ImageUploadField.vue";
import FieldXCheckbox from "~/components/forms/FieldXCheckbox.vue";
import FormButton from '../atoms/FormButton.vue'
import type { ProductAdditional } from '~/types/products.type'

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
  is_highlight: z.coerce.boolean(),
  highlight_image: z.string().nullable().optional(),
  highlight_description: z.string().nullable().optional(),
  is_recommended: z.coerce.boolean(),
  is_upsell: z.coerce.boolean(),
  category_id: z.string().min(1, 'Category is required'),
  additionals: z.array(z.object({
    // id is optional for update, not sent on create
    id: z.string().optional(),
    price: z.coerce.number().int('Price must be an integer'),
    moq: z.coerce.number().int('MOQ must be an integer'),
    stock: z.coerce.number().int('Stock must be an integer'),
    discount: z.coerce.number().int('Discount must be an integer'),
    discount_type: z.string().min(1, 'Discount type is required'),
    attributes: z.array(z.object({
      id: z.string().optional(),
      category: z.string().min(1, 'Category is required'),
      name: z.string().min(1, 'Name is required'), // single string per Product model
    })),

  })).min(1, 'At least one additional is required'),
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
    is_highlight: false,
    highlight_image: '',
    highlight_description: '',
    is_recommended: false,
    is_upsell: false,
    category_id: '',
    additionals: [
      {
        price: 0,
        moq: 0,
        stock: 0,
        discount: 0,
        discount_type: 'AMOUNT',
        attributes: [
          { category: '', name: '' }
        ]
      }
    ],
  }
})

// For dynamic additionals and attributes
const additionals = ref([...values.additionals as ProductAdditional[]])

function addAdditional() {
  additionals.value.push({
    price: 0,
    moq: 0,
    stock: 0,
    discount: 0,
    discount_type: '',
    attributes: [ { category: '', name: '' } ]
  })
}
function removeAdditional(idx: number) {
  if(additionals.value.length > 1) additionals.value.splice(idx, 1)
}

function addAttribute(addIdx: number) {
  additionals.value[addIdx].attributes.push({ category: '', name: '' })
}
function removeAttribute(addIdx: number, attrIdx: number) {
  if(additionals.value[addIdx].attributes.length > 1) additionals.value[addIdx].attributes.splice(attrIdx, 1)
}

// For filtered name options per category
const attributeNameOptions = ref({}) // { [categoryId]: [name1, name2, ...] }

// Get attribute options for a specific category
function getNamesForCategory(categoryId: string): ProductAttributeOptions[] {
  return attributesByCategory.value[categoryId] || []
}

// Sync local additionals changes back to the form values
watch(additionals, (val) => {
  setFieldValue('additionals', val)
}, { deep: true })

const name = ref('')
const slug = ref('')
const description = ref('')
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

// Fetch product attributes
const productAttributes = ref<ProductAttributeOptions[]>([])
const attributesByCategory = ref<Record<string, ProductAttributeOptions[]>>({})
const loadingAttributes = ref(true)
const errorAttributes = ref(false)

// Fetch product attributes and group them by category
const fetchProductAttributes = async () => {
  try {
    loadingAttributes.value = true
    errorAttributes.value = false
    
    // Get product attributes and wait for data to be loaded
    const attributes = await useOptionsService().getProductAttributes()
    console.log('Product Attributes Data:', attributes)
    
    if (attributes && attributes.length > 0) {
      productAttributes.value = attributes
      
      // Group attributes by category
      attributesByCategory.value = attributes.reduce((acc, attr) => {
        if (!acc[attr.category]) {
          acc[attr.category] = []
        }
        acc[attr.category].push(attr)
        return acc
      }, {} as Record<string, ProductAttributeOptions[]>)
      
      console.log('Attributes By Category:', attributesByCategory.value)
    } else {
      console.warn('No product attributes returned from API')
    }
    
    loadingAttributes.value = false
  } catch (error) {
    console.error('Failed to fetch product attributes:', error)
    errorAttributes.value = true
    loadingAttributes.value = false
  }
}

// Call the fetch function
fetchProductAttributes()

// Watch for API data load and set fields when available
watch(
  [loading, datas],
  ([loadingVal, datasVal]) => {
    if (!isCreate && !loadingVal && datasVal) {
      isApiUpdate = true
      name.value = datasVal.name || ''
      slug.value = datasVal.slug || ''
      description.value = datasVal.description || ''
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
      setFieldValue('highlight_image', datasVal.highlight_image || '')
      setFieldValue('highlight_description', datasVal.highlight_description || '')
      setFieldValue('is_highlight', Boolean(datasVal.is_highlight) || false)
      setFieldValue('is_recommended', Boolean(datasVal.is_recommended) || false)
      setFieldValue('is_upsell', Boolean(datasVal.is_upsell) || false)
      setFieldValue('category_id', datasVal.category_id || '')
      // Set additionals with correct mapping
      setFieldValue('additionals', (datasVal.additionals || []).map((add) => ({
        ...add,
        attributes: (add.attributes || []).map(attr => ({
          ...attr,
          name: typeof attr.name === 'string' ? attr.name : (Array.isArray(attr.name) ? attr.name[0] || '' : '')
        }))
      })))
      isApiUpdate = false
    }
  },
  { immediate: true }
)

const generateSlug = (str: string) => {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
}

watch(() => name.value, (newName) => {
  if (newName) {
    slug.value = generateSlug(newName)
  } else {
    slug.value = ''
  }
}, { immediate: true })

const handleSubmitForm = handleSubmit(async (values) => {
  const submitData = {
    ...values,
    slug: slug.value || generateSlug(name.value)
  }
  try {
    // Ensure boolean values are properly converted
    submitData.is_recommended = Boolean(submitData.is_recommended);
    submitData.is_upsell = Boolean(submitData.is_upsell);

    // If highlight is required, handle upload if needed
    if (submitData.is_highlight) {
      // If a file is selected but no url yet, upload it
      if (highlight_image_file.value && !submitData.highlight_image) {
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
        submitData.highlight_image = url;
        highlight_image.value = url;
      }
      if (!submitData.highlight_image) {
        toast.error('Please select an image for highlight.');
        return;
      }
    }
    // --- PLACEHOLDER: Insert your custom logic here if needed ---
    // console.log('Highlight image URL:', submitData.highlight_image);

    console.log(submitData)
    if (isCreate) {
      await useProductService().createProduct(submitData)
      toast.success('Product created successfully!')
    } else {
      await useProductService().updateProductById(id, submitData)
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
    <!-- Additionals Section -->
    <div class="w-full">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold">Additionals</h3>
        <Button type="button" @click="addAdditional">Add Additional</Button>
      </div>
      <div v-for="(additional, addIdx) in additionals" :key="addIdx" class="border rounded p-4 mb-4 relative">
        <Button type="button" variant="destructive" class="absolute top-2 right-2" @click="removeAdditional(addIdx)" v-if="additionals.length > 1">Remove</Button>
        <div class="flex flex-wrap">
          <div class="w-full md:w-1/2 lg:w-1/3 px-1">
            <label class="block font-semibold">Price</label>
            <Input type="number" v-model.number="additional.price" placeholder="Enter price" />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/3 px-1">
            <label class="block font-semibold">MOQ</label>
            <Input type="number" v-model.number="additional.moq" placeholder="Enter MOQ" />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/3 px-1">
            <label class="block font-semibold">Stock</label>
            <Input type="number" v-model.number="additional.stock" placeholder="Enter stock" />
          </div>
          <div class="w-full md:w-1/2 px-1">
            <label class="block font-semibold">Discount</label>
            <Input type="number" v-model.number="additional.discount" placeholder="Enter discount" />
          </div>
          <div class="w-full md:w-1/2 px-1">
            <label class="block font-semibold">Discount Type</label>
            <select v-model="additional.discount_type" class="w-full border rounded px-2 py-1">
              <option v-for="type in dtypes" :key="type.id" :value="type.id">{{ type.label }}</option>
            </select>
          </div>
        </div>
        <!-- Attributes -->
        <div class="mt-4">
          <div class="flex justify-between items-center flex-wrap md:flex-nowrap">
            <span class="font-semibold">Attributes</span>
            <Button type="button" size="sm" @click="addAttribute(addIdx)">Add Attribute</Button>
          </div>
          <div v-for="(attr, attrIdx) in additional.attributes" :key="attrIdx" class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="col-span-1">
              <label class="block text-xs">Category</label>
              <select v-model="attr.category" class="w-full border rounded px-2 py-1">
                <option value="" disabled>Select category</option>
                <option v-for="category in Object.keys(attributesByCategory)" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="block text-xs">Name</label>
              <select v-model="attr.name" class="w-full border rounded px-2 py-1" :disabled="!attr.category">
                <option value="" disabled>{{ !attr.category ? 'Select category first' : 'Select name' }}</option>
                <option 
                  v-for="attrOption in getNamesForCategory(attr.category || '')" 
                  :key="attrOption.id.toString()" 
                  :value="attrOption.label"
                >
                  {{ attrOption.label }}
                </option>
              </select>
            </div>
            <Button type="button" variant="destructive" size="sm" @click="removeAttribute(addIdx, attrIdx)" v-if="additional.attributes.length > 1">Remove</Button>
          </div>
        </div>
      </div>
    </div>
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
    />
    <!-- Is Upsell -->
    <FieldXCheckbox
      name="is_upsell"
      label="Is Upsell"
      v-model="is_upsell"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_upsell')"
    />

    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>