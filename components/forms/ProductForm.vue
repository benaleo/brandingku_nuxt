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
import FieldXSelectWithGroupParent from "~/components/forms/fields/FieldXSelectWithGroupParent.vue";
import FormButton from "../atoms/FormButton.vue";
import type { ProductAdditional, ProductColorDraft, ProductGallery } from "~/types/products.type";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import ProductAdditionalForm from "~/components/forms/ProductAdditionalForm.vue";
import { useOptionProductCategories } from "~/composables/useOptionProductCategories";
import GalleryMultiUploadForm from "./GalleryMultiUploadForm.vue";
import ProductColorForm from "./ProductColorForm.vue";
import FieldXArea from "./fields/FieldXArea.vue";
import Label from "../ui/label/Label.vue";
import QuillEditor from "~/components/editor/QuillEditor.vue";

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

const { datas, loading, error, reFetch, createProduct, updateProductById } = useProductService(false, id);

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
// existing gallery ids removed in the form; deleted (with their stored files) on save
const removedGalleryIds = ref<string[]>([]);
// colour variants; each may carry its own picture
const colors = ref<ProductColorDraft[]>([]);

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

        colors.value = (datasVal.colors || []).map((c: any, i: number) => ({
          key: i + 1,
          id: c.id != null ? String(c.id) : undefined,
          name: c.name || "",
          image: c.image ? `${STORAGE_URL}${c.image}` : "",
          file: null,
        }));

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
        // Ensure vee-validate sees values loaded from API
        setFieldValue('name', datasVal.name || '');
        setFieldValue('slug', datasVal.slug || '');
        // Ensure vee-validate sees the description value loaded from API
        try { setFieldValue('description', description.value ?? ''); } catch {}
        try { setFieldValue('product_category_id', product_category_id.value ?? ''); } catch {}
        // Sync boolean flags to vee-validate
        try { setFieldValue('is_highlight', is_highlight.value); } catch {}
        try { setFieldValue('is_recommended', is_recommended.value); } catch {}
        try { setFieldValue('is_upsell', is_upsell.value); } catch {}
        try { setFieldValue('is_active', is_active.value); } catch {}
        // Stop watching after first population
        stopInitWatch();
      }, 0);
    }
  },
  { immediate: true, flush: "post" }
);

// name and slug live only in vee-validate (FieldXText binds through componentField)
watch(
  () => product_category_id.value,
  (val) => {
    try { setFieldValue('product_category_id', val ?? ''); } catch {}
  },
  { flush: 'post' }
);

// Sync boolean flags to vee-validate on change
watch(
  () => is_highlight.value,
  (val) => {
    console.debug("[watch] is_highlight:", val);
    try { setFieldValue('is_highlight', val); } catch {}
  },
  { flush: 'post' }
);

watch(
  () => is_recommended.value,
  (val) => {
    console.debug("[watch] is_recommended:", val);
    try { setFieldValue('is_recommended', val); } catch {}
  },
  { flush: 'post' }
);

watch(
  () => is_upsell.value,
  (val) => {
    console.debug("[watch] is_upsell:", val);
    try { setFieldValue('is_upsell', val); } catch {}
  },
  { flush: 'post' }
);

watch(
  () => is_active.value,
  (val) => {
    console.debug("[watch] is_active:", val);
    try { setFieldValue('is_active', val); } catch {}
  },
  { flush: 'post' }
);

// Keep vee-validate 'description' in sync with Quill editor content without heavy loops
let descSyncTimer: number | null = null;
watch(
  () => description.value,
  (val) => {
    if (descSyncTimer != null) {
      clearTimeout(descSyncTimer as unknown as number);
    }
    descSyncTimer = window.setTimeout(() => {
      try { setFieldValue('description', val ?? ''); } catch {}
      descSyncTimer = null;
    }, 120);
  },
  { flush: 'post' }
);

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
};

watch(
  () => formValues.name,
  (newName) => {
    // Only auto-generate slug when creating a new product.
    if (!isCreate) return;
    setFieldValue("slug", newName ? generateSlug(newName) : "");
  }
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
    // Debug boolean flags
    console.debug("[submit] boolean refs:", {
      is_highlight: is_highlight.value,
      is_recommended: is_recommended.value,
      is_upsell: is_upsell.value,
      is_active: is_active.value,
    });
    console.debug("[submit] boolean vee-validate values:", {
      is_highlight: formValues.is_highlight,
      is_recommended: formValues.is_recommended,
      is_upsell: formValues.is_upsell,
      is_active: formValues.is_active,
    });
    const submitData: any = {
      name: submittedValues.name,
      slug: submittedValues.slug || generateSlug(submittedValues.name),
      description: description.value,
      image: image.value,
      product_category_id: product_category_id.value,
      is_highlight: Boolean(formValues.is_highlight),
      is_recommended: Boolean(formValues.is_recommended),
      is_upsell: Boolean(formValues.is_upsell),
      is_active: Boolean(formValues.is_active),
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

      // colours: a new file goes up as base64, a stored picture is sent back as its path
      const blankColor = colors.value.findIndex((c) => !c.name.trim());
      if (blankColor >= 0) {
        toast.error(`Nama warna ke-${blankColor + 1} wajib diisi`);
        return;
      }
      const { convertToBase64: colorToBase64 } = useFileToBase64();
      submitData.colors = await Promise.all(
        colors.value.map(async (c) => {
          let img = "";
          if (c.file) {
            const b64 = await colorToBase64(c.file);
            const comma = b64.indexOf(",");
            img = b64.startsWith("data:") && comma >= 0 ? b64.slice(comma + 1) : b64;
          } else if (c.image.startsWith(STORAGE_URL)) {
            img = c.image.slice(STORAGE_URL.length);
          }
          return { id: c.id, name: c.name.trim(), image: img };
        })
      );

      console.log(submitData);

      // First save the form data
      if (isCreate) {
        await createProduct({
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
          colors: submitData.colors,
        });
        toast.success("Product created successfully!");
      } else {
        console.log('[[submit]] updateProductById', {
          id,
          data: submitData
        })
        await updateProductById(id, {
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
          removed_gallery_ids: removedGalleryIds.value,
          colors: submitData.colors,
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
  notifyFormValidationError
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
    class="editor-form"
    @submit.prevent="handleSubmitForm"
  >
    <FormsFormSection title="Informasi produk" description="Lengkapi nama, alamat halaman, dan deskripsi produk.">
    <div class="form-url">
      <p class="text-sm font-bold italic">
        {{ config.public.BASE_URL }} /product/
      </p>
      <!-- Slug -->
      <FieldXText
        name="slug"
        label=""
        placeholder="Enter slug"
        :disabled="disabled"
        :isFieldDirty="isFieldDirty('slug')"
        :item-class="'min-w-0 flex-1'"
        :input-class="'h-10'"
      />
    </div>

    <!-- Name -->
    <FieldXText
      name="name"
      label="Name"
      placeholder="Enter name"
      :disabled="disabled"
      :isFieldDirty="isFieldDirty('name')"
    />

    <!-- Description -->
    <div class="min-w-0 w-full space-y-2">
    <Label for="description">Description</Label>
      <ClientOnly>
        <QuillEditor
          :options="{ theme: 'snow', placeholder: 'Enter description' }"
          toolbar="minimal"
          contentType="html"
          v-model:content="description"
        />
      </ClientOnly>
    </div>
    </FormsFormSection>
    <FormsFormSection title="Foto produk" description="Pilih gambar utama dan lengkapi galeri produk.">
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

    <!-- Galleries Section -->
    <GalleryMultiUploadForm v-model="galleries" v-model:removedIds="removedGalleryIds" :disabled="disabled" />
    </FormsFormSection>

    <FormsFormSection title="Varian warna" description="Tambahkan pilihan warna. Gambar per warna opsional; tanpa gambar, warna memakai gambar utama produk.">
      <ProductColorForm v-model="colors" :fallback-image="image" :disabled="disabled" />
    </FormsFormSection>

    <FormsFormSection title="Varian & harga" description="Kelola pilihan produk, harga, stok, dan atributnya.">
      <ProductAdditionalForm v-model="additionals" />
    </FormsFormSection>

    <FormsFormSection title="Kategori & visibilitas" description="Tentukan kategori dan posisi produk di website.">

    <!-- Product Categories -->
    <!-- 
      NOTE: The warning about "Extraneous non-props attributes (class)" occurs in the ComboboxPortal.
      
      Fix options:
      1. Remove class="w-full" from <ComboboxPortal> in the ComboboxList component
      2. OR modify FieldXSelect to use a custom wrapper with inheritAttrs: false
      3. OR use a wrapper div with the class around the FieldXSelect
    -->
    <FieldXSelectWithGroupParent
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
      itemClass="w-full"
    />

    <div class="form-grid">
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

    </div>
    </FormsFormSection>
    <!-- Form Button -->
    <FormButton :handleBack="handleBack" />
  </form>
</template>
