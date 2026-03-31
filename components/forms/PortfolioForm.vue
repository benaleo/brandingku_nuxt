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
import { usePortfolioCategories } from "~/composables/usePortfolioCategories";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import FieldXSelect from "~/components/forms/fields/FieldXSelect.vue";
import { Button } from "~/components/ui/button";
import type { PortfolioGallery } from "~/types/portfolio.type";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import PortfolioGalleryForm from "./PortfolioGalleryForm.vue";
import FieldXArea from "./fields/FieldXArea.vue";
import Label from "../ui/label/Label.vue";

const router = useRouter();
const { token } = useAuth();
const currentPath = router.currentRoute.value.path;
const id = getIdFromPath(router.currentRoute.value.path);
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

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
const { options: categoryOptions, loading: categoriesLoading, error: categoriesError, fetch: fetchCategories } = usePortfolioCategories();

const isEdit = computed(() => !!id && id !== 'add');

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
    is_active: z.coerce.boolean(),
    galleries: z
      .array(
        z.object({
          id: z.coerce.string().optional(),
          file: z.string().optional(),
        })
      )
      .optional(),
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
    is_active: true,
    galleries: [],
  },
});

// For dynamic galleries (managed locally; synced to payload on submit)
const galleries = ref<PortfolioGallery[]>([]);

// Load existing data when editing
watch(loading, (isLoading) => {
  if (!isLoading && datas.value && isEdit.value) {
    const portfolio = datas.value;
    setFieldValue("category", portfolio.category || "");
    setFieldValue("title", portfolio.title || "");
    setFieldValue("subtitle", portfolio.subtitle || "");
    setFieldValue("client", portfolio.client || "");
    setFieldValue("is_active", portfolio.is_active ?? true);
    galleries.value = portfolio.galleries?.map((g: PortfolioGallery) => ({ ...g, id: g.id.toString() })) || [];
  }
});

// Watch galleries changes to sync with form
watch(galleries, (newGalleries) => {
  const formGalleries = newGalleries.map(g => ({
    id: g.id.toString(),
    file: g.file
  }));
  setFieldValue("galleries", formGalleries);
}, { deep: true });

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = {
      ...values,
      galleries: galleries.value,
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
});

const addGallery = () => {
  galleries.value.push({
    id: Date.now(),
    portfolio_id: 0,
    file: "",
    created_at: new Date().toISOString(),
  });
};

const removeGallery = (index: number) => {
  galleries.value.splice(index, 1);
};

const updateGallery = (index: number, gallery: PortfolioGallery) => {
  galleries.value[index] = gallery;
};

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
  <div class="space-y-6">

    <!-- Form -->
    <form @submit="onSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Category -->
        <FieldXSelect
          name="category"
          label="Category"
          placeholder="Select portfolio category"
          :options="categoryOptions"
          :loading="categoriesLoading"
          value-field="label"
          label-field="label"
          required
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

      <!-- Galleries Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Label class="text-base font-medium">Gallery Images</Label>
          <Button type="button" variant="outline" size="sm" @click="addGallery">
            Add Image
          </Button>
        </div>

        <div v-if="galleries.length === 0" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p class="text-gray-500">No gallery images added yet</p>
          <p class="text-sm text-gray-400 mt-1">Click "Add Image" to upload images</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PortfolioGalleryForm
            v-for="(gallery, index) in galleries"
            :key="gallery.id"
            :gallery="gallery"
            :index="index"
            @update="updateGallery"
            @remove="removeGallery"
          />
        </div>
      </div>

      <!-- Submit Buttons (Only One Set) -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          class="px-6"
          @click="() => navigateTo('/console/secret/portfolio')"
        >
          Batal
        </Button>
        <Button type="submit" class="px-6" :disabled="loading">
          Simpan
        </Button>
      </div>
    </form>
  </div>
</template>
