<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch, onMounted, computed } from 'vue'
import { toast } from "vue-sonner";
import { useProductCategoryService } from '~/services/product-category.service'
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FieldXArea from '~/components/forms/fields/FieldXArea.vue'
import FormButton from "~/components/atoms/FormButton.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import type { ProductCategoryRequest } from '~/types/products.type';
import { useFileToBase64 } from '~/composables/useFileToBase64'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'

const router = useRouter()
const props = defineProps<{
  isChild?: boolean
  parentId?: number | null
  hideSubCategories?: boolean
  editId?: number | null
  detail?: any
}>()
const currentPath = router.currentRoute.value.path
const idFromPath = getIdFromPath(router.currentRoute.value.path)
const resolvedEditId = computed(() => props.editId ?? idFromPath)
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

const service = useProductCategoryService({ autoFetchParents: false })
const { detail, loadDetail } = service

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  sub_categories: z.array(z.string()).optional(),
  image: z.string().optional(),
  cover: z.string().optional(),
  is_active: z.coerce.boolean(),
  is_landing_page: z.coerce.boolean(),
}))

const { isFieldDirty, setFieldValue, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const slug = ref('')
const description = ref('')
const sub_categories = ref<string[]>([])
const is_active = ref(false)
const is_landing_page = ref(false)

const image = ref('')
const imageFile = ref<File | null>(null)
const cover = ref('')
const coverFile = ref<File | null>(null)

const imageInput: Ref<HTMLInputElement | null> = ref(null)
const coverInput: Ref<HTMLInputElement | null> = ref(null)

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

const setFieldsFromDetail = (val: any) => {
  isApiUpdate = true
  name.value = val.name || ''
  const apiSlug = val.slug || ''
  slug.value = apiSlug
  description.value = val.description || ''
  
  // Extract sub-category names from the nested structure
  sub_categories.value = Array.isArray(val.sub_categories) 
    ? val.sub_categories.map((sc: any) => sc?.name || '').filter(Boolean) 
    : []
  
  image.value = val.image ? STORAGE_URL + val.image : ''
  cover.value = val.cover ? STORAGE_URL + val.cover : ''
  is_active.value = Boolean(val.is_active) || false
  is_landing_page.value = Boolean(val.is_landing_page) || false

  // Update form values
  setFieldValue('name', name.value)
  setFieldValue('slug', slug.value)
  setFieldValue('description', description.value)
  setFieldValue('sub_categories', sub_categories.value)
  setFieldValue('image', image.value)
  setFieldValue('cover', cover.value)
  setFieldValue('is_active', is_active.value)
  setFieldValue('is_landing_page', is_landing_page.value)
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
    } catch (e) {
      console.error('Failed to load category detail', e)
    }
  }
})

// Watch for detail load and set fields when available
watch(
  detail,
  (val) => {
    if (!isCreate && val) {
      // Reuse the same mapping logic, including sub_categories name extraction
      setFieldsFromDetail(val)
    }
  },
  { immediate: true }
)

const onImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    image.value = URL.createObjectURL(imageFile.value)
  }
}

const onCoverChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    coverFile.value = target.files[0]
    cover.value = URL.createObjectURL(coverFile.value)
  }
}

const removeImage = () => {
  image.value = ''
  imageFile.value = null
}

const removeCover = () => {
  cover.value = ''
  coverFile.value = null
}

const handleDrop = (event: DragEvent, type: 'image' | 'cover') => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files[0] && files[0].type.startsWith('image/')) {
    if (type === 'image') {
      imageFile.value = files[0]
      image.value = URL.createObjectURL(files[0])
    } else {
      coverFile.value = files[0]
      cover.value = URL.createObjectURL(files[0])
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const updateSlugFromName = (nameValue: string | undefined) => {
  // Only auto-generate slug when creating a new record
  if (!isCreate || !nameValue || isApiUpdate) {
    return
  }
  const newSlug = nameValue
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  slug.value = newSlug
  setFieldValue('slug', newSlug)
}

watch(name, (newVal) => {
  if (!isApiUpdate) updateSlugFromName(newVal)
})

const handleSubmitForm = handleSubmit(async (values : ProductCategoryRequest) => {
  try {
    if (isCreate) {
      const payload = { 
        ...values,
        // Ensure sub_categories is an array of strings (names)
        sub_categories: Array.isArray(values.sub_categories) 
          ? values.sub_categories.filter(Boolean) 
          : []
      }
      if (imageFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.image = await convertToBase64(imageFile.value)
        // debug: show base64 prefix and length only
        if (payload.image) {
          console.log('[create] image base64 prefix:', payload.image.substring(0, 30))
          console.log('[create] image base64 length:', payload.image.length)
        }
      }
      if (coverFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.cover = await convertToBase64(coverFile.value)
        // debug: show base64 prefix and length only
        if (payload.cover) {
          console.log('[create] cover base64 prefix:', payload.cover.substring(0, 30))
          console.log('[create] cover base64 length:', payload.cover.length)
        }
      }
      if (props.isChild && props.parentId) {
        const childPayload: any = {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          image: payload.image,
          cover: payload.cover,
          is_landing_page: payload.is_landing_page,
          is_active: payload.is_active,
        }
        await service.createChildCategory(Number(props.parentId), childPayload)
        toast.success('Child category created successfully!')
      } else {
        await service.createProductCategoryWithSubs(payload)
        toast.success('Product category created successfully!')
      }
    } else {
      const payload = { 
        ...values,
        // Ensure sub_categories is an array of strings (names)
        sub_categories: Array.isArray(values.sub_categories) 
          ? values.sub_categories.filter(Boolean) 
          : []
      }
      if (imageFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.image = await convertToBase64(imageFile.value)
        // debug: show base64 prefix and length only
        if (payload.image) {
          console.log('[update] image base64 prefix:', payload.image.substring(0, 30))
          console.log('[update] image base64 length:', payload.image.length)
        }
      } else {
        delete payload.image
      }
      if (coverFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.cover = await convertToBase64(coverFile.value)
        // debug: show base64 prefix and length only
        if (payload.cover) {
          console.log('[update] cover base64 prefix:', payload.cover.substring(0, 30))
          console.log('[update] cover base64 length:', payload.cover.length)
        }
      } else {
        delete payload.cover
      }
      if (props.isChild && resolvedEditId.value) {
        const childPayload: any = {
          name: payload.name!,
          slug: payload.slug,
          description: payload.description!,
          image: payload.image,
          cover: payload.cover,
          is_landing_page: payload.is_landing_page,
          is_active: payload.is_active,
          sub_categories: payload.sub_categories || [],
        }
        await service.updateChildCategory(Number(resolvedEditId.value), childPayload)
        toast.success('Child category updated successfully!')
      } else {
        await service.updateProductCategoryById(resolvedEditId.value as any, payload)
        toast.success('Product category updated successfully!')
      }
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
  <form class="w-full space-y-6" @submit.prevent="handleSubmitForm">
    <div class="pb-4 flex items-end w-full">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /category/
      </p>
      <!-- Slug -->
      <FieldXText name="slug" label="" placeholder="Enter slug" v-model="slug" :disabled="disabled"
        :isFieldDirty="isFieldDirty('slug')" :item-class="'inline-flex'" :input-class="'h-6'" />
    </div>

    <!-- Name -->
    <FieldXText name="name" label="Name" placeholder="Enter name" v-model="name" :disabled="disabled"
      :isFieldDirty="isFieldDirty('name')" />

    <!-- Description -->
    <FieldXArea name="description" label="Description" placeholder="Enter description" :disabled="disabled"
      v-model="description" :validate-on-blur="!isFieldDirty('description')" />

    <!-- Image -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Image</label>
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @drop="(e) => !disabled && handleDrop(e, 'image')"
        @dragover="(e) => !disabled && handleDragOver(e)"
        @click="!disabled && imageInput?.click()"
      >
        <input 
          ref="imageInput"
          type="file" 
          @change="onImageChange" 
          accept="image/*" 
          :disabled="disabled" 
          class="hidden"
        />
        
        <div v-if="!image" class="space-y-2">
          <div class="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">Drag and drop image here, or click to select</p>
          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        
        <div v-else class="relative inline-block">
          <img :src="image" alt="Preview" class="max-w-xs max-h-48 object-cover rounded-lg" />
          <button 
            v-if="!disabled"
            type="button"
            @click.stop="removeImage"
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Cover -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Cover</label>
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @drop="(e) => !disabled && handleDrop(e, 'cover')"
        @dragover="(e) => !disabled && handleDragOver(e)"
        @click="!disabled && coverInput?.click()"
      >
        <input 
          ref="coverInput"
          type="file" 
          @change="onCoverChange" 
          accept="image/*" 
          :disabled="disabled" 
          class="hidden"
        />
        
        <div v-if="!cover" class="space-y-2">
          <div class="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">Drag and drop cover image here, or click to select</p>
          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        
        <div v-else class="relative inline-block">
          <img :src="cover" alt="Cover Preview" class="max-w-xs max-h-48 object-cover rounded-lg" />
          <button 
            v-if="!disabled"
            type="button"
            @click.stop="removeCover"
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Sub Category -->
    <FormField v-if="!props.hideSubCategories" v-slot="{ componentField }" name="sub_categories">
      <FormItem>
        <FormLabel>Sub Categories</FormLabel>
        <FormControl>
          <TagsInput :model-value="componentField.modelValue"
            @update:model-value="componentField['onUpdate:modelValue']">
            <TagsInputItem v-for="item in componentField.modelValue" :key="item" :value="item" :disabled=disabled>
              <TagsInputItemText />
              <TagsInputItemDelete />
            </TagsInputItem>

            <TagsInputInput placeholder="Sub Categories..." />
          </TagsInput>
        </FormControl>
        <FormDescription>
          Select your sub categories.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Is Landing Page -->
    <FieldXCheckbox name="is_landing_page" label="Is Landing Page" v-model="is_landing_page" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_landing_page')" />


    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')" />


    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>