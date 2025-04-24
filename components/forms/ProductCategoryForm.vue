<script setup lang="ts">
import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import * as z from 'zod'
import {ref, watch} from 'vue'
import {toast} from "vue-sonner";
import {useProductCategoryService} from '~/services/product-category.service'
import {getIdFromPath, getPathWithoutIdInForm} from "~/utils/global.utils";
import {useRouter} from 'vue-router'
import FieldXText from "~/components/forms/FieldXText.vue";
import FieldXArea from '~/components/forms/FieldXArea.vue'
import FormButton from "~/components/atoms/FormButton.vue";
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
} = useProductCategoryService(false, id)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  is_active: z.coerce.boolean(),
  is_landing_page: z.coerce.boolean(),
}))

const {isFieldDirty, setFieldValue, handleSubmit} = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const slug = ref('')
const description = ref('')
const is_active = ref(false)
const is_landing_page = ref(false)

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
        is_active.value = Boolean(datasVal.is_active) || false
        is_landing_page.value = Boolean(datasVal.is_landing_page) || false

        setFieldValue('name', datasVal.name || '')
        setFieldValue('slug', datasVal.slug || '')
        setFieldValue('description', datasVal.description || '')
        setFieldValue('is_active', Boolean(datasVal.is_active) || false)
        setFieldValue('is_landing_page', Boolean(datasVal.is_active) || false)
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
      await useProductCategoryService().createProductCategory(values as any)
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
      <FieldXText
          name="slug"
          label=""
          placeholder="Enter slug"
          v-model="slug"
          :disabled="disabled"
          :isFieldDirty="isFieldDirty('slug')"
          :item-class="'inline-flex'"
          :input-class="'h-6'"
      />
    </div>

    <!-- Name -->
    <FieldXText
        name="name"
        label="Name"
        placeholder="Enter name"
        v-model="name"
        :disabled="disabled"
        :isFieldDirty="isFieldDirty('name')"
    />

    <FieldXArea
        name="description"
        label="Description"
        placeholder="Enter description"
        :disabled="disabled"
        v-model="description"
        :validate-on-blur="!isFieldDirty('description')"
    />

    <!-- Is Landing Page -->
    <FieldXCheckbox name="is_landing_page" label="Is Landing Page" v-model="is_landing_page" :disabled="disabled"
                    :isFieldDirty="isFieldDirty('is_landing_page')"/>


    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled" :isFieldDirty="isFieldDirty('is_active')"/>


    <!-- Form Button -->
    <FormButton :handleBack="handleBack"/>
  </form>
</template>