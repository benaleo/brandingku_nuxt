<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useAccessService } from '~/services/access.service'
import type { Permission, Role, RoleInput } from '~/types/access.type'
definePageMeta({ layout: 'console-secret' })
useHead({ title: 'Role & Permission' })
const service = useAccessService()
const { access, can, refresh } = useConsoleAccess()
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formOpen = ref(false)
const editing = ref<Role | null>(null)
const deleting = ref<Role | null>(null)
const editable = computed(() => !editing.value ? can('roles.create') : can('roles.update') && !['superadmin', 'user'].includes(editing.value.name) && editing.value.id !== access.value?.role.id && (!editing.value.is_system || access.value?.role.name === 'superadmin'))
const load = async () => {
  loading.value = true; error.value = ''
  try { const [r, p] = await Promise.all([service.roles(), service.permissions()]); roles.value = r.roles; permissions.value = p.permissions }
  catch (e) { error.value = getErrorMessage(e) }
  finally { loading.value = false }
}
onMounted(load)
const save = async (input: RoleInput) => {
  saving.value = true
  try { await service.saveRole(editing.value?.id ?? null, input); toast.success('Role dan permission berhasil disimpan'); formOpen.value = false; await load(); await refresh() }
  catch (e) { toast.error(getErrorMessage(e)) }
  finally { saving.value = false }
}
const remove = async () => {
  if (!deleting.value) return
  saving.value = true
  try { await service.deleteRole(deleting.value.id); deleting.value = null; formOpen.value = false; toast.success('Role berhasil dihapus'); await load() }
  catch (e) { toast.error(getErrorMessage(e)) }
  finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <ElementsAppBreadcrumb />
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><h1 class="text-2xl font-bold">Role & Permission</h1><p class="mt-1 text-sm text-muted-foreground">Atur menu dan tindakan yang boleh diakses setiap role.</p></div>
      <UiButton v-if="can('roles.create')" :disabled="loading || saving" @click="editing = null; formOpen = true">Tambah role</UiButton>
    </div>
    <div v-if="error" role="alert" class="rounded-xl border border-destructive p-4 text-destructive">{{ error }} <UiButton variant="outline" @click="load">Coba lagi</UiButton></div>
    <div v-else class="grid min-w-0 grid-cols-1 items-start gap-6" :class="formOpen ? 'xl:grid-cols-[280px_minmax(0,1fr)]' : ''">
      <div v-if="loading" class="space-y-3"><UiSkeleton v-for="i in 10" :key="i" class="h-20 w-full rounded-xl" /></div>
      <div v-else class="grid gap-3" :class="!formOpen ? 'md:grid-cols-2 xl:grid-cols-3' : ''">
        <article v-for="role in roles" :key="role.id" class="rounded-xl border bg-card p-4" :class="editing?.id === role.id && formOpen ? 'border-primary' : ''">
          <button class="w-full text-left" type="button" :disabled="saving" @click="editing = role; formOpen = true">
            <div class="flex items-center justify-between gap-2"><span class="font-semibold">{{ role.name }}</span><span class="text-xs text-muted-foreground">{{ role.is_active ? 'Aktif' : 'Nonaktif' }}</span></div>
            <p class="mt-2 text-sm text-muted-foreground">{{ role.description || 'Tanpa deskripsi' }}</p>
            <p class="mt-3 text-xs text-muted-foreground">{{ role.name === 'superadmin' ? 'Akses penuh' : `${role.permission_ids.length} permission` }}{{ role.is_system ? ' · Role sistem' : '' }}</p>
          </button>
          <UiButton v-if="!role.is_system && can('roles.delete') && role.id !== access?.role.id" class="mt-3" variant="outline" size="sm" :disabled="saving" @click="deleting = role">Hapus role</UiButton>
        </article>
        <p v-if="!roles.length" class="text-muted-foreground">Belum ada role.</p>
      </div>
      <FormsRoleForm v-if="formOpen && !loading" :key="editing?.id ?? 'new'" :role="editing" :permissions="permissions" :saving="saving" :editable="editable" @submit="save" @cancel="formOpen = false" />
    </div>
    <UiAlertDialog :open="!!deleting" @update:open="!$event && !saving && (deleting = null)">
      <UiAlertDialogContent><UiAlertDialogHeader><UiAlertDialogTitle>Hapus role {{ deleting?.name }}?</UiAlertDialogTitle><UiAlertDialogDescription>Role yang masih digunakan oleh user tidak dapat dihapus.</UiAlertDialogDescription></UiAlertDialogHeader>
        <UiAlertDialogFooter><UiAlertDialogCancel :disabled="saving">Batal</UiAlertDialogCancel><UiAlertDialogAction :disabled="saving" @click.prevent="remove">{{ saving ? 'Menghapus…' : 'Hapus' }}</UiAlertDialogAction></UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
