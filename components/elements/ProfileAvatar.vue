<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Camera, Loader2 } from 'lucide-vue-next'

// The profile photo, or the name's initial without one. `editable` adds a button to upload a
// new photo for the signed-in account; the new path comes back through `updated`.
const props = defineProps<{ avatar?: string | null; name: string; editable?: boolean }>()
const emit = defineEmits<{ updated: [path: string] }>()

const { t } = useI18n()
const config = useRuntimeConfig()
const { gqlFetch } = useGql()
const src = computed(() => (!props.avatar ? '' : props.avatar.startsWith('http') ? props.avatar : `${config.public.STORAGE_URL}${props.avatar}`))
const initial = computed(() => (props.name || '?').charAt(0).toUpperCase())

const input = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const upload = async (e: Event) => {
  const el = e.target as HTMLInputElement
  const file = el.files?.[0]
  el.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) return toast.error(t('app.avatar.notImage'))
  if (file.size > MAX_UPLOAD_BYTES) return toast.error(t('app.avatar.tooLarge'))
  busy.value = true
  try {
    const res = await gqlFetch<{ updateMyAvatar: string }>(
      'mutation updateMyAvatar($photo: EmailAttachmentInput!) { updateMyAvatar(photo: $photo) }',
      { photo: { file_name: file.name, content_type: file.type, content: await readFileAsDataURL(file) } },
      { auth: true, timeout: 60000 },
    )
    emit('updated', res.updateMyAvatar)
    toast.success(t('app.avatar.updated'))
  } catch (err: any) {
    toast.error(err?.message || t('app.avatar.failed'))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="relative size-14 shrink-0 md:size-16">
    <img v-if="src" :src="src" :alt="name" class="size-full rounded-full object-cover" />
    <span v-else class="flex size-full items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700" aria-hidden="true">{{ initial }}</span>
    <template v-if="editable">
      <button
        type="button"
        class="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-70"
        :disabled="busy"
        :aria-label="t('app.avatar.change')"
        :title="t('app.avatar.change')"
        @click="input?.click()"
      >
        <Loader2 v-if="busy" class="size-3.5 animate-spin" />
        <Camera v-else class="size-3.5" />
      </button>
      <input ref="input" type="file" accept="image/*" class="sr-only" tabindex="-1" aria-hidden="true" @change="upload" />
    </template>
  </div>
</template>
