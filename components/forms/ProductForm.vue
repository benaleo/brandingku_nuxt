<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { ref, watch, onMounted, nextTick } from "vue";
import { toast } from "vue-sonner";
import { getIdFromPath, getPathWithoutIdInForm } from "~/utils/global.utils";
import { useRouter } from "vue-router";
import { useProductService } from "~/services/product.service";
import { useFileToBase64 } from "~/composables/useFileToBase64";
import { useAuth } from "~/composables/useAuth";
import ImageUploadField from "~/components/forms/ImageSingleUploadField.vue";
import FieldXCheckbox from "~/components/forms/fields/FieldXCheckbox.vue";
import FieldXSelect from "~/components/forms/fields/FieldXSelect.vue";
import FormButton from "../atoms/FormButton.vue";
import type { ProductAdditional, ProductGallery } from "~/types/products.type";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import ProductAdditionalForm from "~/components/forms/ProductAdditionalForm.vue";
import { useOptionProductCategories } from "~/composables/useOptionProductCategories";
import ProductGalleryForm from "./ProductGalleryForm.vue";
import FieldXArea from "./fields/FieldXArea.vue";

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

const { datas, loading, error, reFetch } = useProductService(false, id);

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().nullable().optional(),
    description: z.string().min(1, "Description is required"),
    image: z.string().nullable().optional(),
    is_highlight: z.coerce.boolean(),
    is_recommended: z.coerce.boolean(),
    is_upsell: z.coerce.boolean(),
    is_active: z.coerce.boolean(),
    product_category_id: z.string().min(1, "Category is required"),
    additionals: z
      .array(
        z.object({
          id: z.coerce.string().optional(),
          name: z.string().optional().default(""),
          price: z.coerce.number().int("Price must be an integer"),
          moq: z.coerce.number().int("MOQ must be an integer"),
          stock: z.coerce.number().int("Stock must be an integer"),
          discount: z.coerce.number().int("Discount must be an integer"),
          discount_type: z.string().min(1, "Discount type is required"),
          attributes: z.string().optional().default(""),
        })
      )
      .min(1, "At least one additional is required"),
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
    name: "",
    slug: "",
    description: "",
    image: "",
    is_highlight: false,
    is_recommended: false,
    is_upsell: false,
    is_active: true,
    product_category_id: "",
    additionals: [
      {
        name: "",
        price: 0,
        moq: 0,
        stock: 0,
        discount: 0,
        discount_type: "AMOUNT",
        attributes: "[]",
      },
    ],
  },
});

// For dynamic additionals (managed locally; synced to payload on submit)
const additionals = ref([...(formValues.additionals as ProductAdditional[])]);

const name = ref("");
const slug = ref("");
const description = ref("");
const image = ref("");
const image_file = ref<File | null>(null);
const is_highlight = ref(false);
const is_recommended = ref(false);
const is_upsell = ref(false);
const is_active = ref(true);
const product_category_id = ref("");
// Page mode flags
const isCreate = currentPath.includes("/add");
const isDetail = currentPath.includes("/detail");
const isEdit = currentPath.includes("/edit") || currentPath.includes("/update");
// disable only on detail view, not on edit or create
const disabled = isDetail && !isEdit;
// Only render form after data is populated in edit mode
const ready = ref(isCreate);

// Removed explicit syncing of description to vee-validate to avoid feedback loops.

// Track images that should be deleted on submit
const imagesToDelete = ref<{ url: string; path: string; bucket: string }[]>([]);

// Handle image delete requests
function handleImageDelete(imageData: {
  url: string;
  path: string;
  bucket: string;
}) {
  console.log("Image marked for deletion:", imageData);
  imagesToDelete.value.push(imageData);
}

// Fetch product categories via new composable
const {
  options: categoryOptions,
  loading: categoryLoading,
  error: errorCategory,
  fetch: fetchCategoryOptions,
} = useOptionProductCategories();
onMounted(() => {
  fetchCategoryOptions();
});

// Show warning in console if in update mode
if (!isCreate) {
  console.warn("UPDATE MODE!");
}

// Galleries with proper synchronization and image path handling
const galleries = ref<ProductGallery[]>([]);

// Watch for API data load and set fields ONCE when available
const initialized = ref(false);
const stopInitWatch = watch(
  () => datas.value,
  async (datasVal) => {
    if (!isCreate && !initialized.value && datasVal) {
      // Mark initialized early to avoid mid-execution recursive triggers
      initialized.value = true;
      // Defer mutations to avoid synchronous recursive updates
      setTimeout(async () => {
        name.value = datasVal.name || "";
        slug.value = datasVal.slug || "";
        description.value = datasVal.description || "";
        await nextTick();
        image.value = datasVal.image ? `${STORAGE_URL}${datasVal.image}` : "";
        is_highlight.value = Boolean(datasVal.is_highlight) || false;
        is_recommended.value = Boolean(datasVal.is_recommended) || false;
        is_upsell.value = Boolean(datasVal.is_upsell) || false;
        is_active.value =
          datasVal.is_active !== undefined ? Boolean(datasVal.is_active) : true;
        product_category_id.value = datasVal.category?.id
          ? String(datasVal.category.id)
          : "";
        galleries.value = (datasVal.galleries || []).map(
          (gallery: {
            image?: string;
            orders?: number;
            [key: string]: any;
          }) => ({
            ...gallery,
            image: gallery.image ? `${STORAGE_URL}${gallery.image}` : "",
            orders: gallery.orders || 1,
          })
        );

        const processedAdditionals = (datasVal.additionals || []).map(
          (add: any) => {
            const rawAttr =
              typeof add.attributes === "string" ? add.attributes : "";
            let attributes = "[]";
            try {
              if (rawAttr && Array.isArray(JSON.parse(rawAttr))) {
                attributes = rawAttr;
              }
            } catch (_) {
              attributes = "[]";
            }
            return {
              ...add,
              id: add.id != null ? String(add.id) : undefined,
              name: add.name || "",
              price: Number(add.price) || 0,
              moq: Number(add.moq) || 0,
              stock: Number(add.stock) || 0,
              discount: Number(add.discount) || 0,
              discount_type: add.discount_type || "AMOUNT",
              attributes,
            };
          }
        );
        additionals.value = processedAdditionals;
        console.log("Form data loaded from API:", processedAdditionals);
        ready.value = true;
        // Stop watching after first population
        stopInitWatch();
      }, 0);
    }
  },
  { immediate: true, flush: "post" }
);

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
};

watch(
  () => name.value,
  (newName) => {
    // Only auto-generate slug when creating a new product.
    if (!isCreate) return;
    if (newName) {
      slug.value = generateSlug(newName);
    } else {
      slug.value = "";
    }
  },
  { immediate: true }
);

const handleSubmitForm = handleSubmit(
  async (submittedValues) => {
    // Ensure v-model updates from child forms are flushed
    await nextTick();
    // Debug current additionals sources
    console.debug(
      "[submit] additionals (ref):",
      JSON.parse(JSON.stringify(additionals.value))
    );
    console.debug(
      "[submit] additionals (formValues):",
      JSON.parse(JSON.stringify(formValues.additionals))
    );
    const submitData: any = {
      name: name.value,
      slug: slug.value || generateSlug(name.value),
      description: description.value,
      image: image.value,
      product_category_id: product_category_id.value,
      is_highlight: Boolean(is_highlight.value),
      is_recommended: Boolean(is_recommended.value),
      is_upsell: Boolean(is_upsell.value),
      is_active: Boolean(is_active.value),
      // Normalize additionals to correct types and ensure strings are present
      additionals: ((additionals.value as any[]) || []).map((add) => ({
        id:
          add.id != null && `${add.id}`.length > 0 ? String(add.id) : undefined,
        name: add.name ?? "",
        price: Number((add as any).price ?? 0),
        moq: Number((add as any).moq ?? 0),
        stock: Number((add as any).stock ?? 0),
        discount: Number((add as any).discount ?? 0),
        discount_type: (add as any).discount_type ?? "AMOUNT",
        attributes:
          typeof (add as any).attributes === "string"
            ? (add as any).attributes
            : "[]",
      })),
      galleries: galleries.value,
    };
    try {
      // Ensure boolean values are properly converted
      submitData.is_recommended = Boolean(submitData.is_recommended);
      submitData.is_upsell = Boolean(submitData.is_upsell);
      submitData.is_active = Boolean(submitData.is_active);

      console.log("Galleries data:", submitData.galleries);
      console.debug(
        "[submit] final additionals payload:",
        JSON.parse(JSON.stringify(submitData.additionals))
      );

      // Process galleries to ensure proper data format and raw base64 for backend
      if (submitData.galleries && submitData.galleries.length > 0) {
        submitData.galleries = submitData.galleries.map((gallery: any) => {
          let img = gallery?.image || "";
          // Prefer raw base64 captured by child form
          if (
            gallery &&
            typeof gallery._raw === "string" &&
            gallery._raw.length > 0
          ) {
            img = gallery._raw;
          } else if (typeof img === "string" && img.startsWith("data:")) {
            // Extract base64 from data URL
            const comma = img.indexOf(",");
            img = comma >= 0 ? img.slice(comma + 1) : img;
          } else if (typeof img === "string" && img.startsWith(STORAGE_URL)) {
            // Strip storage prefix if an absolute URL was set
            img = img.slice(STORAGE_URL.length);
          }
          return {
            ...gallery,
            image: img,
            orders: Number(gallery.orders) || 1,
          };
        });
      }

      // Convert main image to base64 if file selected and no value yet
      if (image_file.value && !submitData.image) {
        const { convertToBase64 } = useFileToBase64();
        const file = image_file.value;
        const b64 = await convertToBase64(file);
        submitData.image = b64;
        image.value = b64;
      }

      // Normalize main image string for backend (send raw base64 without prefix)
      if (submitData.image && typeof submitData.image === "string") {
        // Remove STORAGE_URL prefix if present
        if (submitData.image.startsWith(STORAGE_URL)) {
          submitData.image = submitData.image.slice(STORAGE_URL.length);
        }
        // If it's a data URL, strip the prefix to keep only the raw base64
        if (submitData.image.startsWith("data:")) {
          const commaIdx = submitData.image.indexOf(",");
          submitData.image =
            commaIdx >= 0
              ? submitData.image.slice(commaIdx + 1)
              : submitData.image;
        }
      }

      console.log(submitData);

      // First save the form data
      if (isCreate) {
        await useProductService().createProduct({
          name: submitData.name,
          slug: submitData.slug,
          description: submitData.description,
          image: submitData.image,
          product_category_id: Number(submitData.product_category_id),
          is_highlight: Boolean(submitData.is_highlight),
          is_recommended: Boolean(submitData.is_recommended),
          is_upsell: Boolean(submitData.is_upsell),
          is_active: submitData.is_active,
          additionals: submitData.additionals,
          galleries: submitData.galleries || [],
        });
        toast.success("Product created successfully!");
      } else {
        await useProductService().updateProductById(id, {
          name: submitData.name,
          slug: submitData.slug,
          description: submitData.description,
          image: submitData.image,
          product_category_id: Number(submitData.product_category_id),
          is_highlight: Boolean(submitData.is_highlight),
          is_recommended: Boolean(submitData.is_recommended),
          is_upsell: Boolean(submitData.is_upsell),
          is_active: submitData.is_active,
          additionals: submitData.additionals,
          galleries: submitData.galleries || [],
        });
        toast.success("Product updated successfully!");
      }

      // Skipped storage deletions since we now send base64 directly

      // Navigate back
      router.push(getPathWithoutIdInForm(currentPath));
    } catch (e) {
      toast.error("Failed to save product");
      console.error(e);
    }
  },
  (errors) => {
    try {
      const firstField = Object.keys(errors || {})[0];
      const firstMsg = firstField ? (errors as any)[firstField]?.[0] : null;
      toast.error(firstMsg || "Please fix validation errors before submitting");
      console.warn("Form validation errors:", errors);
    } catch (err) {
      toast.error("Please fix validation errors before submitting");
      console.warn("Form validation errors:", errors);
    }
  }
);

const imageUploading = ref(false);
function onImageUploaded(url: string) {
  image.value = url;
}
function onUploading(val: boolean) {
  imageUploading.value = val;
}
function handleBack() {
  router.push(getPathWithoutIdInForm(currentPath));
}
</script>

<template>
  <form
    v-if="ready"
    class="w-full space-y-6 flex flex-wrap"
    @submit.prevent="handleSubmitForm"
  >
    <div class="pb-4 flex items-end w-full">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /product/
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

    <!-- Description -->
    <div class="w-full mb-6">
      <ClientOnly>
        <QuillEditor
          :options="{ theme: 'snow', placeholder: 'Enter description' }"
          toolbar="minimal"
          contentType="html"
          v-model:content="description"
        />
      </ClientOnly>
    </div>
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
    <FieldXSelect
      name="product_category_id"
      label="Kategori"
      placeholder="Select category"
      searchPlaceholder="Search category..."
      emptyMessage="No category found."
      v-model="product_category_id"
      :options="categoryOptions ?? []"
      :loading="categoryLoading"
      :error="errorCategory !== null"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('product_category_id')"
      itemClass="w-full md:w-1/2"
    />

    <!-- Is Highlight -->
    <FieldXCheckbox
      name="is_highlight"
      label="Is Highlight"
      v-model="is_highlight"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_highlight')"
    />

    <!-- Removed highlight-specific fields; single image field is used -->

    <!-- Is Recommended -->
    <FieldXCheckbox
      name="is_recommended"
      label="Is Recommended"
      v-model="is_recommended"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_recommended')"
    />
    <!-- Is Upsell -->
    <FieldXCheckbox
      name="is_upsell"
      label="Is Upsell"
      v-model="is_upsell"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_upsell')"
    />
    <!-- Is Active -->
    <FieldXCheckbox
      name="is_active"
      label="Is Active"
      v-model="is_active"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('is_active')"
    />

    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>
