<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, watch, onMounted } from 'vue'
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

const router = useRouter()
const currentPath = router.currentRoute.value.path
const id = getIdFromPath(router.currentRoute.value.path)
const config = useRuntimeConfig()

const {
  detail,
  loadDetail,
} = useProductCategoryService()

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  sub_categories: z.array(z.string()).optional(),
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

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

// Load detail on mount for edit/detail pages
onMounted(async () => {
  if (!isCreate && id) {
    try {
      await loadDetail(Number(id))
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
      isApiUpdate = true
      name.value = val.name || ''
      const apiSlug = val.slug || ''
      slug.value = apiSlug
      description.value = val.description || ''
      sub_categories.value = (val as any).sub_categories || []
      is_active.value = Boolean(val.is_active) || false
      is_landing_page.value = Boolean(val.is_landing_page) || false

      // Update form values
      setFieldValue('name', name.value)
      setFieldValue('slug', slug.value)
      setFieldValue('description', description.value)
      setFieldValue('sub_categories', sub_categories.value)
      setFieldValue('is_active', is_active.value)
      setFieldValue('is_landing_page', is_landing_page.value)
      isApiUpdate = false
    }
  },
  { immediate: true }
)

const updateSlugFromName = (nameValue: string | undefined) => {
  if (!nameValue || isApiUpdate) {
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
    console.log(values)
    if (isCreate) {
      await useProductCategoryService().createProductCategoryWithSubs(values)
      toast.success('Product category created successfully!')
    } else {
      await useProductCategoryService().updateProductCategoryById(id, values)
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

    <!-- Sub Category -->
    <FormField v-slot="{ componentField }" name="sub_categories">
      <FormItem>
        <FormLabel>Sub Categories</FormLabel>
        <FormControl>
          <TagsInput :model-value="componentField.modelValue"
            @update:model-value="componentField['onUpdate:modelValue']">
            <TagsInputItem v-for="item in componentField.modelValue" :key="item" :value="item">
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