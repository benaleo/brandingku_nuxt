<script setup lang="ts">
// thin quill 2 wrapper; replaces @vueup/vue-quill (quill 1.3.7 used the removed DOMNodeInserted event)
import 'quill/dist/quill.snow.css'
import type Quill from 'quill'

type Toolbar = 'minimal' | 'essential' | unknown[]

const props = withDefaults(defineProps<{
  content?: string
  contentType?: 'html'
  theme?: 'snow' | 'bubble'
  toolbar?: Toolbar
  readOnly?: boolean
  options?: Record<string, any>
}>(), { content: '', contentType: 'html', theme: 'snow', readOnly: false })

const emit = defineEmits<{
  'update:content': [value: string]
  blur: [quill: Quill]
  focus: [quill: Quill]
  ready: [quill: Quill]
}>()

const presets: Record<string, unknown[]> = {
  minimal: [
    [{ header: 1 }, { header: 2 }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
  ],
  essential: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
    ['blockquote', 'code-block', 'link'],
    [{ color: [] }, 'clean'],
  ],
}

const el = ref<HTMLElement>()
let quill: Quill | null = null
let lastHtml: string | null = null

// quill 2.0.3 getSemanticHTML turns every space into &nbsp;, which stops text wrapping on the storefront
const readHtml = () => {
  if (!quill || quill.getLength() <= 1) return ''
  return quill.getSemanticHTML().replace(/&nbsp;/g, ' ')
}

const writeHtml = (html: string) => {
  if (!quill) return
  quill.setContents(quill.clipboard.convert({ html: html || '' }), 'silent')
  lastHtml = html || ''
}

onMounted(async () => {
  const { default: QuillCtor } = await import('quill')
  if (!el.value) return
  const opts = props.options || {}
  const toolbar = props.toolbar
    ? (typeof props.toolbar === 'string' ? presets[props.toolbar] : props.toolbar)
    : opts.modules?.toolbar
  quill = new QuillCtor(el.value, {
    ...opts,
    theme: props.theme,
    readOnly: props.readOnly || opts.readOnly,
    modules: { ...opts.modules, ...(toolbar ? { toolbar } : {}) },
  })
  writeHtml(props.content)
  quill.on('text-change', () => {
    const html = readHtml()
    lastHtml = html
    emit('update:content', html)
  })
  quill.on('selection-change', (range, oldRange) => {
    if (!quill) return
    if (!range && oldRange) emit('blur', quill)
    else if (range && !oldRange) emit('focus', quill)
  })
  emit('ready', quill)
})

watch(() => props.content, (html) => {
  if (quill && html !== lastHtml) writeHtml(html)
})

watch(() => props.readOnly, (ro) => quill?.enable(!ro))

onBeforeUnmount(() => { quill = null })
</script>

<template>
  <div class="quill-editor-wrapper">
    <div ref="el" />
  </div>
</template>
