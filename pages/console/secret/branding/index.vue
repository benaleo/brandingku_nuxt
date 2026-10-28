<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useBrandingService } from '~/services/branding.service'
import type { BrandingMethod } from '~/types/branding.type'

definePageMeta({ layout: 'console-secret' })
useHead({ title: 'Branding' })

const service = useBrandingService()
const { can } = useConsoleAccess()
const methods = ref<BrandingMethod[]>([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const formOpen = ref(false)
const editing = ref<BrandingMethod | null>(null)
const deleting = ref<BrandingMethod | null>(null)
const form = reactive({ name: '', description: '', is_active: true, orders: 0 })

const load = async () => {
  loading.value = true
  error.value = ''
  try { methods.value = await service.getBrandingMethods() }
  catch (e) { error.value = getErrorMessage(e) }
  finally { loading.value = false }
}
onMounted(load)

const openForm = (m: BrandingMethod | null) => {
  editing.value = m
  Object.assign(form, m
    ? { name: m.name, description: m.description, is_active: m.is_active, orders: m.orders }
    : { name: '', description: '', is_active: true, orders: methods.value.length })
  formOpen.value = true
}

const save = async () => {
  if (!form.name.trim()) {
    toast.error('Nama metode wajib diisi')
    return
  }
  saving.value = true
  try {
    const input = { name: form.name.trim(), description: form.description.trim(), is_active: form.is_active, orders: Math.floor(Number(form.orders) || 0) }
    if (editing.value) await service.updateBrandingMethod(editing.value.id, input)
    else await service.createBrandingMethod(input)
    toast.success('Metode branding disimpan')
    formOpen.value = false
    await load()
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!deleting.value) return
  saving.value = true
  try {
    await service.deleteBrandingMethod(deleting.value.id)
    toast.success(`${deleting.value.name} dihapus`)
    deleting.value = null
    await load()
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <ElementsAppBreadcrumb />
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Branding</h1>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          Metode branding seperti sablon, UV print, grafir, atau emboss. Harga default diatur per kategori,
          lalu tiap produk memilih metode yang tersedia dan bisa memakai harga sendiri.
        </p>
      </div>
      <UiButton v-if="can('brandings.create')" :disabled="loading || saving" @click="openForm(null)">
        <Plus class="size-4" /> Tambah metode
      </UiButton>
    </div>

    <div v-if="error" role="alert" class="rounded-xl border border-destructive p-4 text-destructive">
      {{ error }} <UiButton variant="outline" @click="load">Coba lagi</UiButton>
    </div>
    <div v-else-if="loading" class="rounded-xl border p-6 text-sm text-muted-foreground">Memuat…</div>
    <div v-else-if="!methods.length" class="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      Belum ada metode branding.
    </div>
    <div v-else class="overflow-x-auto rounded-xl border">
      <table class="w-full min-w-[560px] text-sm">
        <thead class="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th class="px-4 py-2 w-16">Urutan</th>
            <th class="px-4 py-2">Metode</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in methods" :key="m.id" class="border-b last:border-0">
            <td class="px-4 py-3 text-muted-foreground">{{ m.orders }}</td>
            <td class="px-4 py-3">
              <p class="font-medium">{{ m.name }}</p>
              <p v-if="m.description" class="text-xs text-muted-foreground">{{ m.description }}</p>
            </td>
            <td class="px-4 py-3">
              <UiBadge :class="m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'">
                {{ m.is_active ? 'Aktif' : 'Nonaktif' }}
              </UiBadge>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <UiButton v-if="can('brandings.update')" variant="ghost" size="icon" :aria-label="`Ubah ${m.name}`" @click="openForm(m)">
                  <Pencil class="size-4" />
                </UiButton>
                <UiButton v-if="can('brandings.delete')" variant="ghost" size="icon" class="hover:text-red-600" :aria-label="`Hapus ${m.name}`" @click="deleting = m">
                  <Trash2 class="size-4" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UiDialog :open="formOpen" @update:open="(v: boolean) => { if (!v && !saving) formOpen = false }">
      <UiDialogContent class="sm:max-w-md">
        <UiDialogHeader>
          <UiDialogTitle>{{ editing ? 'Ubah metode branding' : 'Tambah metode branding' }}</UiDialogTitle>
          <UiDialogDescription>Harga diisi di halaman kategori dan produk.</UiDialogDescription>
        </UiDialogHeader>
        <form class="space-y-4" @submit.prevent="save">
          <div class="space-y-1.5">
            <UiLabel for="bm-name">Nama</UiLabel>
            <UiInput id="bm-name" v-model="form.name" maxlength="80" placeholder="Mis. Sablon" />
          </div>
          <div class="space-y-1.5">
            <UiLabel for="bm-desc">Deskripsi</UiLabel>
            <UiTextarea id="bm-desc" v-model="form.description" rows="3" maxlength="500" placeholder="Opsional, tampil di halaman produk" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <UiLabel for="bm-orders">Urutan</UiLabel>
              <UiInput id="bm-orders" v-model="form.orders" type="number" min="0" />
            </div>
            <label class="flex items-center gap-2 self-end pb-2 text-sm">
              <input v-model="form.is_active" type="checkbox" class="size-4 accent-green-600" />
              Aktif
            </label>
          </div>
          <UiDialogFooter>
            <UiButton type="button" variant="outline" :disabled="saving" @click="formOpen = false">Batal</UiButton>
            <UiButton type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <UiAlertDialog :open="!!deleting" @update:open="!$event && !saving && (deleting = null)">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Hapus {{ deleting?.name }}?</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Harga metode ini di semua kategori dan produk ikut terhapus. Pesanan yang sudah dibuat tidak berubah.
            Untuk menyembunyikan sementara, nonaktifkan saja.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel :disabled="saving">Batal</UiAlertDialogCancel>
          <UiAlertDialogAction :disabled="saving" @click.prevent="remove">{{ saving ? 'Menghapus…' : 'Hapus' }}</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
