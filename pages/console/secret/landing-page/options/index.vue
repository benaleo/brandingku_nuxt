<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div v-if="loading" class="py-4 text-center">Loading...</div>
    <div v-else-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
    <form v-else class="editor-form" @submit.prevent="save">
      <FormsFormSection
        title="Kontak & alamat"
        description="Ditampilkan di footer, halaman Kontak, dan tombol WhatsApp produk. Perubahan langsung berlaku di website."
      >
        <div class="form-grid">
          <div v-for="field in FIELDS" :key="field.key" class="space-y-2" :class="field.wide ? 'md:col-span-2' : ''">
            <Label :for="field.key">{{ field.label }}</Label>
            <Textarea
              v-if="field.multiline"
              :id="field.key"
              v-model="values[field.key]"
              rows="2"
              :placeholder="field.placeholder"
              :disabled="!canEdit || saving"
            />
            <Input
              v-else
              :id="field.key"
              v-model="values[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              :disabled="!canEdit || saving"
            />
            <p class="text-xs text-muted-foreground">{{ descriptions[field.key] || field.hint }}</p>
          </div>
        </div>
        <p v-if="lastUpdated" class="text-xs text-muted-foreground">Terakhir diubah {{ lastUpdated }}</p>
      </FormsFormSection>

      <div v-if="canEdit" class="form-actions">
        <Button type="button" variant="outline" class="w-full sm:w-auto sm:min-w-28" :disabled="saving || !dirty" @click="reset">
          Batal
        </Button>
        <Button type="submit" class="w-full sm:w-auto sm:min-w-32" :disabled="saving || !dirty">
          <Loader2 v-if="saving" class="size-4 animate-spin"/>
          {{ saving ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import {useAppSettingsService, type AppSetting} from '~/services/app-settings.service'

const pageTitle = 'Options'

const FIELDS: { key: string; label: string; placeholder: string; hint: string; type?: string; multiline?: boolean; wide?: boolean }[] = [
  {key: 'CONTACT_PHONE', label: 'Telepon', placeholder: '+62 851 1724 7345', hint: 'Nomor telepon yang ditampilkan.'},
  {key: 'CONTACT_WHATSAPP', label: 'WhatsApp', placeholder: '6285117247345', hint: 'Angka saja dengan kode negara.'},
  {key: 'CONTACT_EMAIL', label: 'Email', placeholder: 'admin@brandingku.com', hint: 'Email kontak.', type: 'email'},
  {key: 'CONTACT_HOURS', label: 'Jam operasional', placeholder: 'Senin - Jumat, 08.00 - 17.00 WIB', hint: 'Jam operasional.'},
  {key: 'CONTACT_ADDRESS', label: 'Alamat', placeholder: 'Jl. …', hint: 'Alamat kantor.', multiline: true, wide: true},
  {key: 'CONTACT_MAPS_URL', label: 'Link Google Maps', placeholder: 'https://maps.app.goo.gl/…', hint: 'Opsional.', type: 'url', wide: true},
]

const route = useRoute()
const {canAction} = useConsoleAccess()
const canEdit = computed(() => canAction(route.path, 'update'))
const {getAppSettings, updateAppSettings} = useAppSettingsService()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const values = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const descriptions = ref<Record<string, string>>({})
const lastUpdated = ref('')

const dirty = computed(() => FIELDS.some(f => (values[f.key] ?? '') !== (original.value[f.key] ?? '')))

function apply(settings: AppSetting[]) {
  const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
  original.value = map
  descriptions.value = Object.fromEntries(settings.map(s => [s.key, s.description]))
  for (const f of FIELDS) values[f.key] = map[f.key] ?? ''
  const latest = settings.reduce((m, s) => (s.updated_at > m ? s.updated_at : m), '')
  lastUpdated.value = latest ? new Date(latest).toLocaleString() : ''
}

const reset = () => { for (const f of FIELDS) values[f.key] = original.value[f.key] ?? '' }

onMounted(async () => {
  try {
    apply(await getAppSettings('CONTACT_'))
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat options'
  } finally {
    loading.value = false
  }
})

async function save() {
  const changed = FIELDS.filter(f => (values[f.key] ?? '') !== (original.value[f.key] ?? ''))
    .map(f => ({key: f.key, value: values[f.key] ?? ''}))
  if (!changed.length) return
  saving.value = true
  try {
    apply(await updateAppSettings(changed))
    // refresh the cached public settings used by the footer in this session
    await refreshNuxtData('site-settings')
    toast.success('Options berhasil disimpan')
  } catch (e: any) {
    toast.error(String(e?.message || 'Gagal menyimpan options').replace(/^\[GQL\] Request failed:\s*/, ''))
  } finally {
    saving.value = false
  }
}

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
