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
import FieldXVueEditor from '~/components/forms/fields/FieldXVueEditor.vue'
import FormButton from "~/components/atoms/FormButton.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import CategoryImageField from "~/components/forms/CategoryImageField.vue";
import CategoryBrandingForm from "~/components/forms/CategoryBrandingForm.vue";
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

const { isFieldDirty, setFieldValue, handleSubmit, values: formValues } = useForm({
  validationSchema: formSchema,
})

const name = ref('')
const slug = ref('')
const description = ref('')
const sub_categories = ref<string[]>([])
const is_active = ref(false)
const is_landing_page = ref(false)

// image: card on /category · cover: hero of /category/<slug> · landingImage: home page block
const image = ref('')
const imageFile = ref<File | null>(null)
const cover = ref('')
const coverFile = ref<File | null>(null)
const landingImage = ref('')
const landingImageFile = ref<File | null>(null)
const removeLandingImage = ref(false)

type ImageSlot = 'image' | 'cover' | 'landing'
const setImage = (slot: ImageSlot, file: File) => {
  const url = URL.createObjectURL(file)
  if (slot === 'image') { imageFile.value = file; image.value = url }
  else if (slot === 'cover') { coverFile.value = file; cover.value = url }
  else { landingImageFile.value = file; landingImage.value = url; removeLandingImage.value = false }
}
const clearImage = (slot: ImageSlot) => {
  if (slot === 'image') { imageFile.value = null; image.value = '' }
  else if (slot === 'cover') { coverFile.value = null; cover.value = '' }
  else { landingImageFile.value = null; landingImage.value = ''; removeLandingImage.value = true }
}

// the catalog behind the "Request Catalog" button on the public category page: an uploaded
// file, or a link to it elsewhere (e.g. Google Drive); saving one source removes the other
const catalogMode = ref<'file' | 'link'>('file')
const catalogUrl = ref('')
const savedCatalogUrl = ref('')
const catalogUrlValid = computed(() => !catalogUrl.value.trim() || /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(catalogUrl.value.trim()))
const CATALOG_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx']
const MAX_CATALOG_MB = 50
const catalog = ref<{ file: string; name: string; size: number } | null>(null)
const catalogFile = ref<File | null>(null)
const removeCatalog = ref(false)
const catalogProgress = ref<number | null>(null)
const catalogInput: Ref<HTMLInputElement | null> = ref(null)

const formatBytes = (bytes: number) =>
  bytes >= 1 << 20 ? `${(bytes / (1 << 20)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

const pickCatalog = (file?: File | null) => {
  if (!file) return
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!CATALOG_EXTENSIONS.includes(ext)) {
    toast.error('Katalog harus berupa PDF, Word (.doc/.docx) atau Excel (.xls/.xlsx)')
    return
  }
  if (file.size > MAX_CATALOG_MB * 1024 * 1024) {
    toast.error(`Ukuran katalog maksimal ${MAX_CATALOG_MB} MB`)
    return
  }
  catalogFile.value = file
  removeCatalog.value = false
}

const onCatalogChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  pickCatalog(target.files?.[0])
  target.value = ''
}

const clearCatalog = () => {
  if (catalogFile.value) catalogFile.value = null
  else removeCatalog.value = true
}

// runs after the category itself is saved, so new categories get their id first
const syncCatalog = async (id: number | string) => {
  if (catalogMode.value === 'link') {
    const link = catalogUrl.value.trim()
    if (link !== savedCatalogUrl.value || (link && catalog.value)) await service.setCategoryCatalogUrl(id, link)
    return
  }
  // back to a file: the old link goes away
  if (savedCatalogUrl.value) await service.setCategoryCatalogUrl(id, '')
  if (catalogFile.value) {
    catalogProgress.value = 0
    try {
      await service.uploadCategoryCatalog(id, catalogFile.value, (p) => { catalogProgress.value = p })
    } finally {
      catalogProgress.value = null
    }
  } else if (removeCatalog.value && catalog.value) {
    await service.deleteCategoryCatalog(id)
  }
}

const disabled = currentPath.includes("/detail")
const isCreate = currentPath.includes("/add")
let isApiUpdate = false

// default branding prices; saved after the category so a new one has its id
const brandingForm = ref<InstanceType<typeof CategoryBrandingForm> | null>(null)
const brandingCategoryId = computed(() => isCreate ? null : Number(detail.value?.id ?? resolvedEditId.value) || null)
const brandingParentId = computed(() => props.parentId ?? (detail.value as any)?.parent_id ?? null)

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
  landingImage.value = val.landing_image ? STORAGE_URL + val.landing_image : ''
  is_active.value = Boolean(val.is_active) || false
  is_landing_page.value = Boolean(val.is_landing_page) || false
  catalog.value = val.catalog_file ? { file: val.catalog_file, name: val.catalog_file_name || 'katalog', size: Number(val.catalog_file_size) || 0 } : null
  savedCatalogUrl.value = catalogUrl.value = val.catalog_url || ''
  catalogMode.value = val.catalog_url && !val.catalog_file ? 'link' : 'file'

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

const updateSlugFromName = (nameValue: string | undefined) => {
  // Child slugs follow the name on both create and edit.
  if ((!isCreate && !props.isChild) || isApiUpdate) {
    return
  }
  const newSlug = (nameValue || '').trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  slug.value = newSlug
  setFieldValue('slug', newSlug)
}

watch(name, (newVal) => {
  if (!isApiUpdate) updateSlugFromName(newVal)
}, { flush: 'sync' })

const handleSubmitForm = handleSubmit(async (values : ProductCategoryRequest) => {
  let savedId: number | string | undefined = isCreate ? undefined : (resolvedEditId.value as any)
  if (catalogMode.value === 'link' && !catalogUrlValid.value) {
    toast.error('Link katalog harus diawali http:// atau https://')
    return
  }
  const brandingProblem = brandingForm.value?.problem()
  if (brandingProblem) {
    toast.error(`Harga branding ${brandingProblem}`)
    return
  }
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
      if (payload.is_landing_page && landingImageFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.landing_image = await convertToBase64(landingImageFile.value)
      }
      if (props.isChild && props.parentId) {
        const childPayload: any = {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          image: payload.image,
          cover: payload.cover,
          landing_image: payload.landing_image,
          is_landing_page: payload.is_landing_page,
          is_active: payload.is_active,
        }
        savedId = (await service.createChildCategory(Number(props.parentId), childPayload))?.id
        toast.success('Child category created successfully!')
      } else {
        savedId = (await service.createProductCategoryWithSubs(payload))?.id
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
      if (landingImageFile.value) {
        const { convertToBase64 } = useFileToBase64()
        payload.landing_image = await convertToBase64(landingImageFile.value)
      } else if (removeLandingImage.value) {
        payload.landing_image = ''
      }
      if (props.isChild && resolvedEditId.value) {
        const childPayload: any = {
          name: payload.name!,
          slug: payload.slug,
          description: payload.description!,
          image: payload.image,
          cover: payload.cover,
          landing_image: payload.landing_image,
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
  } catch (error) {
    toast.error('Failed to create product category')
    console.error(error)
    return
  }
  if (savedId != null) {
    try {
      await syncCatalog(savedId)
    } catch (error: any) {
      // the category is already saved; report the catalog problem but still leave the form
      toast.error(`Kategori tersimpan, tetapi katalog gagal disimpan: ${error?.message || error}`)
    }
    try {
      await brandingForm.value?.save(Number(brandingCategoryId.value ?? savedId))
    } catch (error: any) {
      toast.error(`Kategori tersimpan, tetapi harga branding gagal disimpan: ${cartErrorMessage(error, 'coba lagi')}`)
    }
  }
  router.push(getPathWithoutIdInForm(currentPath))
}, notifyFormValidationError)

const handleBack = () => {
  router.push(getPathWithoutIdInForm(currentPath))
}
</script>

<template>
  <form class="editor-form" @submit.prevent="handleSubmitForm">
    <FormsFormSection title="Informasi kategori" description="Kelola nama, alamat halaman, dan deskripsi kategori.">
    <div class="form-url">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /category/
      </p>
      <!-- Slug -->
      <FieldXText name="slug" label="" placeholder="Slug otomatis dari nama" v-model="slug" :disabled="disabled || props.isChild"
        :isFieldDirty="isFieldDirty('slug')" :item-class="'min-w-0 flex-1'" :input-class="'h-10'" />
    </div>

    <p v-if="props.isChild" class="text-sm text-muted-foreground">
      Slug dibuat otomatis dari nama. Jika sudah digunakan, akhiran unik akan ditambahkan saat disimpan.
    </p>

    <!-- Name -->
    <FieldXText name="name" label="Name" placeholder="Enter name" v-model="name" :disabled="disabled"
      :isFieldDirty="isFieldDirty('name')" />

    <!-- Description -->
    <FieldXVueEditor name="description" label="Description" placeholder="Enter description" :disabled="disabled"
      v-model="description" :validate-on-blur="!isFieldDirty('description')" />

    </FormsFormSection>
    <FormsFormSection title="Gambar kategori" description="Setiap gambar dipakai di tempat yang berbeda di website.">
      <div class="grid gap-6 md:grid-cols-2">
        <CategoryImageField
          label="Gambar daftar kategori"
          hint="Kartu kategori di halaman /category."
          aspect="aspect-square"
          :preview="image"
          :disabled="disabled"
          @select="(f) => setImage('image', f)"
          @remove="clearImage('image')"
        />
        <CategoryImageField
          label="Cover halaman detail"
          :hint="`Latar hero di halaman /category/${slug || 'slug'}.`"
          aspect="aspect-video"
          :preview="cover"
          :disabled="disabled"
          @select="(f) => setImage('cover', f)"
          @remove="clearImage('cover')"
        />
      </div>
    </FormsFormSection>
    <FormsFormSection
      title="Katalog"
      description="Dibuka pengunjung lewat tombol Request Catalog di halaman kategori: unggah file (PDF, Word atau Excel, maksimal 50 MB) atau cantumkan link-nya, mis. Google Drive."
    >
      <div role="radiogroup" aria-label="Sumber katalog" class="inline-flex rounded-lg border p-1">
        <label
          v-for="opt in ([{ value: 'file', label: 'Unggah file' }, { value: 'link', label: 'Link (Google Drive, dll.)' }] as const)"
          :key="opt.value"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm"
          :class="catalogMode === opt.value ? 'bg-green-600 font-medium text-white' : 'text-muted-foreground hover:bg-muted'"
        >
          <input v-model="catalogMode" type="radio" name="catalog-mode" :value="opt.value" class="sr-only" :disabled="disabled">
          {{ opt.label }}
        </label>
      </div>
      <div v-if="catalogMode === 'link'" class="space-y-1">
        <label for="catalog-url" class="text-sm font-medium">Link katalog</label>
        <input
          id="catalog-url"
          v-model="catalogUrl"
          type="url"
          inputmode="url"
          placeholder="https://drive.google.com/file/d/…"
          class="form-input"
          :class="!catalogUrlValid && 'border-red-500'"
          :aria-invalid="!catalogUrlValid || undefined"
          :disabled="disabled"
        >
        <p class="text-xs" :class="catalogUrlValid ? 'text-muted-foreground' : 'text-red-600'">
          {{ catalogUrlValid ? 'Pastikan akses link terbuka untuk siapa saja. Kosongkan untuk menghapus.' : 'Link harus diawali http:// atau https://' }}
        </p>
        <p v-if="catalog && catalogUrl.trim()" class="text-xs text-amber-700">File katalog yang sudah diunggah akan dihapus saat disimpan.</p>
      </div>
      <template v-else>
      <input
        ref="catalogInput"
        type="file"
        class="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :disabled="disabled"
        @change="onCatalogChange"
      />
      <!-- pending or stored file -->
      <div
        v-if="catalogFile || (catalog && !removeCatalog)"
        class="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3"
      >
        <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-green-100 text-xs font-bold uppercase text-green-700">
          {{ (catalogFile?.name || catalog?.name || '').split('.').pop() }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ catalogFile?.name || catalog?.name }}</p>
          <p class="text-xs text-muted-foreground">
            {{ formatBytes(catalogFile?.size || catalog?.size || 0) }}
            <template v-if="catalogFile"> · akan diunggah saat disimpan</template>
          </p>
        </div>
        <a
          v-if="!catalogFile && catalog"
          :href="`${STORAGE_URL}${catalog.file}`"
          target="_blank"
          rel="noopener"
          class="text-sm font-medium text-green-700 underline"
        >Unduh</a>
        <template v-if="!disabled">
          <button type="button" class="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" @click="catalogInput?.click()">Ganti</button>
          <button type="button" class="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50" @click="clearCatalog">
            {{ catalogFile && catalog && !removeCatalog ? 'Batal ganti' : 'Hapus' }}
          </button>
        </template>
      </div>
      <div
        v-else
        class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
        :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
        @click="!disabled && catalogInput?.click()"
        @dragover.prevent
        @drop.prevent="(e) => !disabled && pickCatalog(e.dataTransfer?.files?.[0])"
      >
        <p class="text-sm text-gray-600">Tarik & lepas file katalog ke sini, atau klik untuk memilih</p>
        <p class="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX · maksimal 50 MB</p>
        <p v-if="removeCatalog" class="mt-2 text-xs text-red-600">Katalog lama akan dihapus saat disimpan.</p>
      </div>
      <div v-if="catalogProgress !== null" class="space-y-1">
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div class="h-2 rounded-full bg-green-600 transition-all" :style="{ width: `${catalogProgress}%` }" />
        </div>
        <p class="text-xs text-muted-foreground">Mengunggah katalog… {{ catalogProgress }}%</p>
      </div>
      <p v-if="savedCatalogUrl" class="text-xs text-amber-700">Link katalog saat ini akan dihapus saat disimpan.</p>
      </template>
    </FormsFormSection>
    <FormsFormSection title="Harga branding default" description="Harga per pcs tiap metode branding untuk produk di kategori ini. Produk bisa memakai harga sendiri.">
      <CategoryBrandingForm
        v-if="isCreate || detail"
        ref="brandingForm"
        :key="brandingCategoryId ?? 'new'"
        :category-id="brandingCategoryId"
        :parent-id="brandingParentId"
        :disabled="disabled"
      />
    </FormsFormSection>
    <FormsFormSection title="Pengaturan kategori" description="Atur subkategori dan visibilitasnya di website.">
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

    <!-- only categories shown on the home page need their own landing image -->
    <!-- read the form value: FieldXCheckbox updates vee-validate, not its local v-model -->
    <div v-if="formValues.is_landing_page" class="max-w-xs">
      <CategoryImageField
        label="Gambar landing page"
        hint="Ikon kategori di beranda. Jika kosong, memakai gambar daftar kategori."
        aspect="aspect-square"
        :preview="landingImage"
        :disabled="disabled"
        @select="(f) => setImage('landing', f)"
        @remove="clearImage('landing')"
      />
    </div>


    <!-- Is Active -->
    <FieldXCheckbox name="is_active" label="Is Active" v-model="is_active" :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')" />


    </FormsFormSection>
    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>
