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
  is_active.value = Boolean(val.is_active) || false
  is_landing_page.value = Boolean(val.is_landing_page) || false

  // Update form values
  setFieldValue('name', name.value)
  setFieldValue('slug', slug.value)
  setFieldValue('description', description.value)
  setFieldValue('sub_categories', sub_categories.value)
  setFieldValue('image', image.value)
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
      if (props.isChild && props.parentId) {
        const childPayload: any = {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          image: payload.image,
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
      if (props.isChild && resolvedEditId.value) {
        const childPayload: any = {
          name: payload.name!,
          slug: payload.slug,
          description: payload.description!,
          image: payload.image,
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
      <input type="file" @change="onImageChange" accept="image/*" :disabled="disabled" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      <img v-if="image" :src="image" alt="Preview" class="max-w-xs max-h-32 object-cover" />
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