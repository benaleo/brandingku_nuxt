<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { ref, onMounted, computed } from 'vue'
import { toast } from "vue-sonner";
import { useBenefitService } from '~/services/benefit.service'
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from 'vue-router'
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import FormButton from "~/components/atoms/FormButton.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import type { Benefit, BenefitRequest } from '~/types/benefit.type';
import { useFileToBase64 } from '~/composables/useFileToBase64'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'

type Lang = 'id' | 'en'

const router = useRouter()
const props = defineProps<{
  editId?: number | null
  detail?: Benefit | null
}>()
const currentPath = router.currentRoute.value.path
const idFromPath = getIdFromPath(router.currentRoute.value.path)
const resolvedEditId = computed(() => props.editId ?? idFromPath)
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

const service = useBenefitService()
const { detail, loadDetail, createBenefit, updateBenefit } = service

const formSchema = toTypedSchema(z.object({
  logo: z.string().optional().default(''),
  orders: z.coerce.number().min(0, 'Orders must be a positive number'),
  is_active: z.coerce.boolean(),
}))

const { isFieldDirty, setFieldValue, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const activeLang = ref<Lang>('id')
const nameByLang = ref<Record<Lang, string>>({ id: '', en: '' })
const questionByLang = ref<Record<Lang, string>>({ id: '', en: '' })
const answerByLang = ref<Record<Lang, string>>({ id: '', en: '' })

const logo = ref('')
const orders = ref(0)
const is_active = ref(false)

// Existing rows may still have plain-string values instead of { id, en } json.
const parseLangJson = (val?: string): Record<Lang, string> => {
  if (!val) return { id: '', en: '' }
  try {
    const parsed = JSON.parse(val)
    if (parsed && typeof parsed === 'object') {
      return { id: parsed.id ?? '', en: parsed.en ?? '' }
    }
  } catch {
    // not json, fall through
  }
  return { id: val, en: '' }
}

const image = ref('') // preview url
const imageFile = ref<File | null>(null)

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

const setFieldsFromDetail = (val: Benefit) => {
  isApiUpdate = true
  nameByLang.value = parseLangJson(val.name)
  questionByLang.value = parseLangJson(val.question)
  answerByLang.value = parseLangJson(val.answer)
  logo.value = val.logo || ''
  orders.value = val.orders || 0
  is_active.value = Boolean(val.is_active) || false

  image.value = val.logo ? STORAGE_URL + val.logo : ''

  // Update form values
  setFieldValue('logo', logo.value)
  setFieldValue('orders', orders.value)
  setFieldValue('is_active', is_active.value)
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
      if (detail.value) {
        setFieldsFromDetail(detail.value)
      }
    } catch (e) {
      console.error('Failed to load benefit detail', e)
    }
  }
})

const onImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    image.value = URL.createObjectURL(imageFile.value)
  }
}

const handleSubmitForm = handleSubmit(async (values) => {
  if (!nameByLang.value.id) {
    toast.error('Name (ID) is required')
    return
  }

  try {
    const payload: BenefitRequest = {
      name: JSON.stringify(nameByLang.value),
      logo: values.logo || logo.value,
      orders: Number(values.orders) || 0,
      question: JSON.stringify(questionByLang.value),
      answer: JSON.stringify(answerByLang.value),
      is_active: Boolean(values.is_active),
    }

    // handle logo file -> base64
    if (imageFile.value) {
      const { convertToBase64 } = useFileToBase64()
      payload.logo = await convertToBase64(imageFile.value)
      // debug
      if (payload.logo) {
        console.log('[benefit] logo base64 prefix:', payload.logo.substring(0, 30))
        console.log('[benefit] logo base64 length:', payload.logo.length)
      }
    }

    if (isCreate) {
      await createBenefit({
        name: payload.name,
        logo: payload.logo || '',
        orders: payload.orders,
        question: payload.question,
        answer: payload.answer,
        is_active: payload.is_active,
      })
      toast.success('Benefit created successfully!')
    } else if (resolvedEditId.value) {
      await updateBenefit({
        id: Number(resolvedEditId.value),
        name: payload.name,
        logo: payload.logo, // optional
        orders: payload.orders,
        question: payload.question,
        answer: payload.answer,
        is_active: payload.is_active,
      })
      toast.success('Benefit updated successfully!')
    }
    router.push(getPathWithoutIdInForm(currentPath))
  } catch (error) {
    toast.error('Failed to submit benefit form')
    console.error(error)
  }
}, notifyFormValidationError)

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}

useHead({
    title: computed(() => {
        if (isCreate) {
            return 'Add Benefit'
        } else if (resolvedEditId.value) {
            return 'Edit Benefit'
        } else {
            return 'Benefit'
        }
    })
})
</script>

<template>
  <form class="editor-form" @submit.prevent="handleSubmitForm">
    <FormsFormSection title="Informasi benefit" description="Tampilkan manfaat layanan dengan informasi yang jelas.">
    <Tabs v-model="activeLang">
      <TabsList>
        <TabsTrigger value="id">Indonesia</TabsTrigger>
        <TabsTrigger value="en">English</TabsTrigger>
      </TabsList>

      <TabsContent value="id" class="space-y-6 pt-4">
        <FieldXText name="name-id" label="Name" placeholder="Enter name" v-model="nameByLang.id" :disabled="disabled" standalone />
        <FieldXText name="question-id" label="Question" placeholder="Enter question" v-model="questionByLang.id" :disabled="disabled" standalone />
        <FieldXText name="answer-id" label="Answer" placeholder="Enter answer" v-model="answerByLang.id" :disabled="disabled" standalone />
      </TabsContent>

      <TabsContent value="en" class="space-y-6 pt-4">
        <FieldXText name="name-en" label="Name" placeholder="Enter name" v-model="nameByLang.en" :disabled="disabled" standalone />
        <FieldXText name="question-en" label="Question" placeholder="Enter question" v-model="questionByLang.en" :disabled="disabled" standalone />
        <FieldXText name="answer-en" label="Answer" placeholder="Enter answer" v-model="answerByLang.en" :disabled="disabled" standalone />
      </TabsContent>
    </Tabs>

    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')" />

    </FormsFormSection>
    <FormsFormSection title="Lainnya" description="Logo dan urutan tampilan benefit.">
    <div class="form-grid">
    <!-- Orders -->
    <FieldXText name="orders" label="Orders" placeholder="Enter orders" type="number" v-model="orders" :disabled="disabled"
      :isFieldDirty="isFieldDirty('orders')" />
    </div>

    <!-- Logo -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Logo</label>
      <input type="file" @change="onImageChange" accept="image/*,.heic,.heif" :disabled="disabled" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      <img v-if="image" :src="image" alt="Preview" class="max-w-xs max-h-32 object-cover" />
    </div>

    </FormsFormSection>
    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>
