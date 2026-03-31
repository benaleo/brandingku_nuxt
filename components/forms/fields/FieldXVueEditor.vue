<script setup lang="ts">
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { defineAsyncComponent, ref, onMounted } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  toolbar: {
    type: Array,
    default: () => [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  }
})

const QuillEditor = defineAsyncComponent(async () => {
  const { QuillEditor } = await import('@vueup/vue-quill')
  return QuillEditor
})

const cssLoaded = ref(false)

onMounted(async () => {
  await import('@vueup/vue-quill/dist/vue-quill.snow.css')
  cssLoaded.value = true
})

const editorOptions = {
  placeholder: props.placeholder,
  readOnly: props.disabled,
  modules: {
    toolbar: props.toolbar
  }
}
</script>

<template>
  <FormField v-slot="{ componentField }" :name="name" :validate-on-blur="validateOnBlur">
    <FormItem v-auto-animate class="w-full">
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl class="mb-8">
        <div :class="{ 'opacity-50 pointer-events-none': disabled }">
          <ClientOnly>
            <QuillEditor
              :content="componentField.modelValue || ''"
              content-type="html"
              theme="snow"
              :options="editorOptions"
              @update:content="(val: string) => componentField['onUpdate:modelValue']?.(val)"
              @blur="(e) => componentField['onBlur']?.(e)"
            />
            <template #fallback>
              <div class="border rounded p-4 bg-gray-50 text-gray-500">
                Loading editor...
              </div>
            </template>
          </ClientOnly>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

<style scoped>
:deep(.ql-editor) {
  min-height: 150px;
}
</style>
