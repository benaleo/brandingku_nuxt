<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
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
import {useOptionsService} from "~/services/options.service";
import type {OptionType, ProductAttributeOptions} from "~/types/options.type";
import ImageUploadField from "~/components/forms/ImageSingleUploadField.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import FieldXSelect from "~/components/forms/fields/FieldXSelect.vue";
import FormButton from '../atoms/FormButton.vue'
import type {ProductAdditional} from '~/types/products.type'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FieldXArea from "~/components/forms/fields/FieldXArea.vue";

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
          {category: '', name: ''}
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
    attributes: [{category: '', name: ''}]
  })
}

function removeAdditional(idx: number) {
  if (additionals.value.length > 1) additionals.value.splice(idx, 1)
}

function addAttribute(addIdx: number) {
  additionals.value[addIdx].attributes.push({category: '', name: ''})
}

function removeAttribute(addIdx: number, attrIdx: number) {
  if (additionals.value[addIdx].attributes.length > 1) additionals.value[addIdx].attributes.splice(attrIdx, 1)
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
}, {deep: true})

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
    {immediate: true}
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
}, {immediate: true})

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
        const {uploadFile, getFileUrl} = useFileUpload();
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
      <FieldXText name="slug" label="" placeholder="Enter slug" v-model="slug" :disabled="disabled"
                  :isFieldDirty="isFieldDirty('slug')" :item-class="'inline-flex'" :input-class="'h-6'"/>
    </div>

    <!-- Name -->
    <FieldXText name="name" label="Name" placeholder="Enter name" v-model="name" :disabled="disabled"
                :isFieldDirty="isFieldDirty('name')"/>

    <!-- Description -->
    <FieldXArea name="description" label="Description" placeholder="Enter description" :disabled="disabled"
                v-model="description" :validate-on-blur="!isFieldDirty('description')"/>

    <!-- Additionals Section -->
    <div class="w-full">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold">Additionals</h3>
        <Button type="button" @click="addAdditional">Add Additional</Button>
      </div>
      <div v-for="(additional, addIdx) in additionals" :key="addIdx" class="border rounded p-4 mb-4 relative">
        <Button type="button" variant="destructive" class="absolute top-2 right-2" @click="removeAdditional(addIdx)"
                v-if="additionals.length > 1">Remove
        </Button>
        <div class="flex flex-wrap space-y-2">
          <!-- Price -->
          <FieldXText item-class="w-full md-1/2 lg:w-1/3" name="price" label="Price" placeholder="Enter price" v-model="additional.price"
                      :disabled="disabled" :isFieldDirty="isFieldDirty(`additionals.${addIdx}.price`)"/>
          <!-- MOQ -->
          <FieldXText item-class="w-full md-1/2 lg:w-1/3" name="moq" label="MOQ" placeholder="Enter MOQ" v-model="additional.moq" :disabled="disabled"
                      :isFieldDirty="isFieldDirty(`additionals.${addIdx}.moq`)"/>
          <!-- Stock -->
          <FieldXText item-class="w-full md-1/2 lg:w-1/3" name="stock" label="Stock" placeholder="Enter stock" v-model="additional.stock"
                      :disabled="disabled" :isFieldDirty="isFieldDirty(`additionals.${addIdx}.stock`)"/>
          <!-- Discount -->
          <FieldXText item-class="w-full md-1/2 lg:w-1/3" name="discount" label="Discount" placeholder="Enter discount" v-model="additional.discount"
                      :disabled="disabled" :isFieldDirty="isFieldDirty(`additionals.${addIdx}.discount`)"/>
          <!-- Discount Type -->
          <div class="w-full md:w-1/2 lg:w-1/3 px-1">
            <label class="block form-label mb-2">Discount Type</label>
            <select v-model="additional.discount_type" class="form-input">
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
          <div v-for="(attr, attrIdx) in additional.attributes" :key="attrIdx"
               class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="col-span-1">
              <label class="form-label mb-2">Kategori Attribute</label>
              <select v-model="attr.category" class="form-input">
                <option value="" disabled>Select category</option>
                <option v-for="category in Object.keys(attributesByCategory)" :key="category" :value="category">{{
                    category
                  }}
                </option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="form-label mb-2">Nama Attribute</label>
              <select v-model="attr.name" class="form-input" :disabled="!attr.category">
                <option value="" disabled>{{ !attr.category ? 'Select category first' : 'Select name' }}</option>
                <option v-for="attrOption in getNamesForCategory(attr.category || '')" :key="attrOption.id.toString()"
                        :value="attrOption.label">
                  {{ attrOption.label }}
                </option>
              </select>
            </div>
            <Button type="button" variant="destructive" size="sm" @click="removeAttribute(addIdx, attrIdx)"
                    v-if="additional.attributes.length > 1">Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
    <!-- Product Categories -->
    <FieldXSelect name="category_id" label="Kategori" placeholder="Select category"
                  searchPlaceholder="Search category..." emptyMessage="No category found." v-model="category_id"
                  :options="categories ?? []" :loading="categoryLoading" :error="errorCategory !== null"
                  :disabled :isFieldDirty="isFieldDirty('category_id')" itemClass="w-full md:w-1/2"/>
    <!-- Is Highlight -->
    <FieldXCheckbox name="is_highlight" label="Is Highlight" v-model="is_highlight" :disabled="disabled"
                    :isFieldDirty="isFieldDirty('is_highlight')"/>

    <!-- Additional if Is Highlight true   -->
    <Card class="w-full" v-if="values.is_highlight">
      <CardContent class="grid gap-2">
        <!-- Highlight Image -->
        <ImageUploadField v-model:fileUrl="highlight_image" v-model:file="highlight_image_file" label="Highlight Image"
                          :disabled="disabled"/>
        <!-- Highlight Description -->
        <FormField v-slot="{ componentField }" name="highlight_description" :validate-on-blur="!isFieldDirty">
          <FormItem class="w-full" v-auto-animate>
            <FormLabel>Highlight Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter highlight description" v-bind="componentField" :disabled="disabled"
                        v-model="highlight_description"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        </FormField>
      </CardContent>
    </Card>
    <!-- Is Recommended -->
    <FieldXCheckbox name="is_recommended" label="Is Recommended" v-model="is_recommended" :disabled="disabled"
                    :isFieldDirty="isFieldDirty('is_recommended')"/>
    <!-- Is Upsell -->
    <FieldXCheckbox name="is_upsell" label="Is Upsell" v-model="is_upsell" :disabled="disabled"
                    :isFieldDirty="isFieldDirty('is_upsell')"/>

    <!-- Form Button -->
    <FormButton :handleBack="handleBack"/>
  </form>
</template>