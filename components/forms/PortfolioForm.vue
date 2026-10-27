<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { toast } from "vue-sonner";
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from "vue-router";
import { usePortfolioService } from "~/services/portfolio.service";
import { useFileToBase64 } from "~/composables/useFileToBase64";
import { useAuth } from "~/composables/useAuth";
import { useOptionProductCategories } from "~/composables/useOptionProductCategories";
import { useOptionProducts } from "~/composables/useOptionProducts";
import FieldXSelect from "~/components/forms/fields/FieldXSelect.vue";
import FieldXSelectWithGroupParent from "~/components/forms/fields/FieldXSelectWithGroupParent.vue";
import type { PortfolioGallery } from "~/types/portfolio.type";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import GalleryMultiUploadForm from "./GalleryMultiUploadForm.vue";
import FormButton from "../atoms/FormButton.vue";

const router = useRouter();
const { token } = useAuth();
const currentPath = router.currentRoute.value.path;
const id = getIdFromPath(router.currentRoute.value.path);

// Ensure user is authenticated
if (!token.value) {
  toast.error("Please login first");
  navigateTo("/login");
}

// Status options for dropdown
const statusOptions = [
  { id: true, label: 'Active' },
  { id: false, label: 'Inactive' }
];

const { datas, loading, error, reFetch, createPortfolio, updatePortfolioById } = usePortfolioService(false, id);
const { options: productCategoryOptions, loading: categoriesLoading, error: categoriesError, fetch: fetchCategories } = useOptionProductCategories();
const { options: productOptions, loading: productsLoading, error: productsError, fetch: fetchProducts } = useOptionProducts();

// portfolio.category is a plain string; store "Parent / Child" so same-named sub categories stay distinct
const categoryOptions = computed(() =>
  productCategoryOptions.value.map((o) => ({
    ...o,
    id: o.parentName ? `${o.parentName} / ${o.label}` : o.label,
    categoryId: Number(o.id),
  }))
);

const isEdit = computed(() => !!id && id !== 'add');
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

// Fetch categories on mount
onMounted(() => {
  fetchCategories();
});

const formSchema = toTypedSchema(
  z.object({
    category: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().nullable().optional(),
    client: z.string().nullable().optional(),
    product_id: z.string().nullable().optional(),
    is_active: z.coerce.boolean(),
  })
);

const {
  isFieldDirty,
  handleSubmit,
  setFieldValue,
  values: formValues,
} = useForm({
  validationSchema: formSchema,
  initialValues: {
    category: "",
    title: "",
    subtitle: "",
    client: "",
    product_id: "",
    is_active: true,
  },
});

// product list follows the selected category; the stored category string is mapped back to its id
const selectedCategory = computed(() =>
  categoryOptions.value.find((o) => o.id === formValues.category)
);

watch(
  () => selectedCategory.value?.id,
  async () => {
    const category = selectedCategory.value;
    await fetchProducts(category?.categoryId ?? null, category?.label);
    // drop a product that does not belong to the newly selected category
    if (!productsError.value && formValues.product_id && !productOptions.value.some((o) => o.id === formValues.product_id)) {
      setFieldValue("product_id", "");
    }
  }
);

// galleries are managed locally and sent with the payload on submit
const galleries = ref<(PortfolioGallery & { _raw?: string })[]>([]);
// existing gallery ids removed in the form; deleted (with their stored files) on save
const removedGalleryIds = ref<string[]>([]);

const toDisplayUrl = (file: string) =>
  !file || file.startsWith("http") || file.startsWith("data:") ? file : `${STORAGE_URL}${file}`;

// Load existing data when editing
watch(loading, (isLoading) => {
  if (!isLoading && datas.value && isEdit.value) {
    const portfolio = datas.value;
    // category will be initialized after categories options are available
    setFieldValue("title", portfolio.title || "");
    setFieldValue("subtitle", portfolio.subtitle || "");
    setFieldValue("client", portfolio.client || "");
    setFieldValue("is_active", portfolio.is_active ?? true);
    setFieldValue("category", portfolio.category || "");
    setFieldValue("product_id", portfolio.product_id ? String(portfolio.product_id) : "");
    galleries.value = (portfolio.galleries || []).map((g: PortfolioGallery) => ({
      ...g,
      id: String(g.id),
      file: toDisplayUrl(g.file),
    }));
  }
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = {
      ...values,
      // new items send raw base64; existing items only update their order
      galleries: galleries.value.map((g) => ({ id: g.id, orders: g.orders, file: g._raw || "" })),
      removed_gallery_ids: removedGalleryIds.value,
    };

    if (isEdit.value) {
      await updatePortfolioById(id, payload);
      toast.success("Portfolio updated successfully");
    } else {
      await createPortfolio(payload);
      toast.success("Portfolio created successfully");
    }

    // Navigate back to list
    navigateTo("/console/secret/portfolio");
  } catch (error: any) {
    console.error("Error saving portfolio:", error);
    toast.error(error.message || "Failed to save portfolio");
  }
}, notifyFormValidationError);

const handleBack = () => navigateTo("/console/secret/portfolio");

const pageTitle = computed(() => {
  return isEdit.value ? 'Edit Portfolio' : 'Add Portfolio'
});

definePageMeta({
  layout: 'console-secret'
});

useHead({
  title: pageTitle,
});
</script>

<template>
  <div class="min-w-0 w-full">

    <!-- Form -->
    <form @submit="onSubmit" class="editor-form">
      <FormsFormSection title="Informasi portfolio" description="Ceritakan proyek dan client yang terlibat.">
      <div class="form-grid">
        <!-- Category -->
        <FieldXSelectWithGroupParent
          name="category"
          label="Category"
          placeholder="Select category"
          searchPlaceholder="Search category..."
          emptyMessage="No category found."
          :options="categoryOptions"
          :loading="categoriesLoading"
          :error="categoriesError !== null"
        />

        <!-- Product (optional, filtered by category) -->
        <FieldXSelectWithGroupParent
          name="product_id"
          label="Product"
          :placeholder="selectedCategory ? 'Select product (optional)' : 'Select category first'"
          searchPlaceholder="Search product..."
          emptyMessage="No product in this category."
          :options="productOptions"
          :loading="productsLoading"
          :error="productsError !== null"
          :disabled="!selectedCategory"
          clearable
          clearLabel="Tanpa product"
        />

        <!-- Title -->
        <FieldXText
          name="title"
          label="Title"
          placeholder="Enter portfolio title"
          required
        />

        <!-- Subtitle -->
        <div class="md:col-span-2">
          <FieldXText
            name="subtitle"
            label="Subtitle"
            placeholder="Enter portfolio subtitle (optional)"
          />
        </div>

        <!-- Client -->
        <FieldXText
          name="client"
          label="Client"
          placeholder="Enter client name (optional)"
        />

        <!-- Status -->
        <FieldXSelect
          name="is_active"
          label="Status"
          placeholder="Select status"
          :options="statusOptions"
          value-field="id"
          label-field="label"
        />
      </div>

      </FormsFormSection>
      <FormsFormSection title="Galeri proyek" description="Tambahkan foto untuk menampilkan hasil pekerjaan.">
      <GalleryMultiUploadForm
        v-model="galleries"
        v-model:removedIds="removedGalleryIds"
        image-key="file"
        title="Gallery Images"
      />

      </FormsFormSection>
      <FormButton :handleBack="handleBack" />
    </form>
  </div>
</template>
