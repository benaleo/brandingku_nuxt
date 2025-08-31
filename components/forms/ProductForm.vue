<script setup lang="ts">

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch, onMounted } from 'vue'
import { toast } from "vue-sonner";
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import { useProductService } from "~/services/product.service";
import { useFileUpload } from '~/composables/useFileUpload'
import ImageUploadField from "~/components/forms/ImageSingleUploadField.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import FieldXSelect from "~/components/forms/fields/FieldXSelect.vue";
import FormButton from '../atoms/FormButton.vue'
import type { ProductAdditional, ProductGallery } from '~/types/products.type'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FieldXArea from "~/components/forms/fields/FieldXArea.vue";
import ProductAdditionalForm from "~/components/forms/ProductAdditionalForm.vue";
import ProductGalleryForm from "~/components/forms/ProductGalleryForm.vue";
import { useOptionProductCategories } from "~/composables/useOptionProductCategories";

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
  image: z.string().nullable().optional(),
  is_highlight: z.coerce.boolean(),
  is_recommended: z.coerce.boolean(),
  is_upsell: z.coerce.boolean(),
  product_category_id: z.string().min(1, 'Category is required'),
  additionals: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional().default(''),
    price: z.coerce.number().int('Price must be an integer'),
    moq: z.coerce.number().int('MOQ must be an integer'),
    stock: z.coerce.number().int('Stock must be an integer'),
    discount: z.coerce.number().int('Discount must be an integer'),
    discount_type: z.string().min(1, 'Discount type is required'),
    attributes: z.string().optional().default(''),
  })).min(1, 'At least one additional is required')
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
    image: '',
    is_highlight: false,
    is_recommended: false,
    is_upsell: false,
    product_category_id: '',
    additionals: [
      {
        name: '',
        price: 0,
        moq: 0,
        stock: 0,
        discount: 0,
        discount_type: 'AMOUNT',
        attributes: ''
      }
    ],
  }
})

// For dynamic additionals
const additionals = ref([...values.additionals as ProductAdditional[]])
// Sync local additionals changes back to the form values
watch(additionals, (val) => {
  setFieldValue('additionals', val)
}, { deep: true })

const name = ref('')
const slug = ref('')
const description = ref('')
const image = ref('')
const image_file = ref<File | null>(null)
const is_highlight = ref(false)
const is_recommended = ref(false)
const is_upsell = ref(false)
const product_category_id = ref('')
const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")

// Track images that should be deleted on submit
const imagesToDelete = ref<{ url: string, path: string, bucket: string }[]>([])

// Handle image delete requests
function handleImageDelete(imageData: { url: string, path: string, bucket: string }) {
  console.log('Image marked for deletion:', imageData)
  imagesToDelete.value.push(imageData)
}

// Fetch product categories via new composable
const { options: categoryOptions, loading: categoryLoading, error: errorCategory, fetch: fetchCategoryOptions } = useOptionProductCategories()
onMounted(() => { fetchCategoryOptions() })

// Show warning in console if in update mode
if (!isCreate) {
  console.warn('UPDATE MODE!');
}

// Galleries
const galleries = ref<ProductGallery[]>([])

// Watch for API data load and set fields when available
watch(
  [loading, datas],
  ([loadingVal, datasVal]) => {
    if (!isCreate && !loadingVal && datasVal) {
      name.value = datasVal.name || ''
      slug.value = datasVal.slug || ''
      description.value = datasVal.description || ''
      image.value = datasVal.image || ''
      is_highlight.value = Boolean(datasVal.is_highlight) || false
      is_recommended.value = Boolean(datasVal.is_recommended) || false
      is_upsell.value = Boolean(datasVal.is_upsell) || false
      product_category_id.value = (datasVal as any).product_category_id || ''
      galleries.value = (datasVal.galleries || [])

      // Update form values for validation
      setFieldValue('name', datasVal.name || '')
      setFieldValue('slug', datasVal.slug || '')
      setFieldValue('description', datasVal.description || '')
      setFieldValue('image', datasVal.image || '')
      setFieldValue('is_highlight', Boolean(datasVal.is_highlight) || false)
      setFieldValue('is_recommended', Boolean(datasVal.is_recommended) || false)
      setFieldValue('is_upsell', Boolean(datasVal.is_upsell) || false)
      setFieldValue('product_category_id', (datasVal as any).product_category_id || '')

      // Process additionals array from API data
      const processedAdditionals = (datasVal.additionals || []).map((add: any) => ({
        ...add,
        name: add.name || '',
        price: Number(add.price) || 0,
        moq: Number(add.moq) || 0,
        stock: Number(add.stock) || 0,
        discount: Number(add.discount) || 0,
        discount_type: add.discount_type || 'AMOUNT',
        attributes: typeof add.attributes === 'string' ? add.attributes : ''
      }))

      // Update additionals ref to trigger UI updates
      additionals.value = processedAdditionals

      // Set form values for additionals
      setFieldValue('additionals', processedAdditionals)

      console.log('Form data loaded from API:', processedAdditionals)
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
  const submitData: any = {
    ...values,
    slug: slug.value || generateSlug(name.value)
  }
  try {
    // Ensure boolean values are properly converted
    submitData.is_recommended = Boolean(submitData.is_recommended);
    submitData.is_upsell = Boolean(submitData.is_upsell);

    // Upload main image if file selected and no url yet
    if (image_file.value && !submitData.image) {
      const { uploadFile, getFileUrl } = useFileUpload();
      const file = image_file.value;
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
      submitData.image = url;
      image.value = url;
    }

    console.log(submitData)

    // First save the form data
    if (isCreate) {
      await useProductService().createProduct({
        name: submitData.name,
        description: submitData.description,
        image: submitData.image,
        product_category_id: Number(submitData.product_category_id),
        is_highlight: Boolean(submitData.is_highlight),
        is_recommended: Boolean(submitData.is_recommended),
        is_upsell: Boolean(submitData.is_upsell),
        is_active: true,
      })
      toast.success('Product created successfully!')
    } else {
      await useProductService().updateProductById(id, {
        name: submitData.name,
        description: submitData.description,
        image: submitData.image,
        product_category_id: Number(submitData.product_category_id),
        is_highlight: Boolean(submitData.is_highlight),
        is_recommended: Boolean(submitData.is_recommended),
        is_upsell: Boolean(submitData.is_upsell),
        is_active: true,
      })
      toast.success('Product updated successfully!')
    }

    // Then process any pending image deletions
    if (imagesToDelete.value.length > 0) {
      const { deleteFile } = useFileUpload();
      let deletionErrors = 0;

      // Process each image to delete
      for (const img of imagesToDelete.value) {
        console.log(`Deleting image: ${img.path} from bucket: ${img.bucket}`);
        const success = await deleteFile(img.bucket, img.path);
        if (!success) {
          deletionErrors++;
          console.error(`Failed to delete image: ${img.path}`);
        }
      }

      // Report deletion results
      if (deletionErrors > 0) {
        if (deletionErrors === imagesToDelete.value.length) {
          toast.error(`Failed to delete ${deletionErrors} image(s)`);
        } else {
          toast.warning(`Deleted ${imagesToDelete.value.length - deletionErrors} image(s), but failed to delete ${deletionErrors} image(s)`);
        }
      } else if (imagesToDelete.value.length > 0) {
        toast.success(`Successfully deleted ${imagesToDelete.value.length} image(s)`);
      }

      // Clear the deletion queue
      imagesToDelete.value = [];
    }

    // Navigate back
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (e) {
    toast.error('Failed to save product')
    console.error(e)
  }
})

const imageUploading = ref(false)
function onImageUploaded(url: string) {
  image.value = url
  setFieldValue('image', url)
}
function onUploading(val: boolean) {
  imageUploading.value = val
}
function handleBack() {
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
    <!-- Image -->
    <ImageUploadField
      v-model:fileUrl="image"
      v-model:file="image_file"
      label="Image"
      :disabled="disabled"
      @update:fileUrl="onImageUploaded"
      @update:isUploading="onUploading"
      @delete="handleImageDelete"
    />

    <!-- Additionals Section -->
    <ProductAdditionalForm v-model="additionals" />

    <!-- Galleries Section -->
    <ProductGalleryForm v-model="galleries" />

    <!-- Product Categories -->
    <!-- 
      NOTE: The warning about "Extraneous non-props attributes (class)" occurs in the ComboboxPortal.
      
      Fix options:
      1. Remove class="w-full" from <ComboboxPortal> in the ComboboxList component
      2. OR modify FieldXSelect to use a custom wrapper with inheritAttrs: false
      3. OR use a wrapper div with the class around the FieldXSelect
    -->
    <FieldXSelect name="product_category_id" label="Kategori" placeholder="Select category"
                  searchPlaceholder="Search category..." emptyMessage="No category found." v-model="product_category_id"
                  :options="categoryOptions ?? []" :loading="categoryLoading" :error="errorCategory !== null"
                  :disabled :isFieldDirty="isFieldDirty('product_category_id')" itemClass="w-full md:w-1/2"/>

    <!-- Is Highlight -->
    <FieldXCheckbox name="is_highlight" label="Is Highlight" v-model="is_highlight" :disabled="disabled"
                    :isFieldDirty="isFieldDirty('is_highlight')"/>

    <!-- Removed highlight-specific fields; single image field is used -->

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