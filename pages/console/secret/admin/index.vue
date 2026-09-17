<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useAccessService } from '~/services/access.service'
import { adminColumns } from '~/components/datatables/adminColumns'
import type { AdminInput, AdminUser, Role } from '~/types/access.type'
definePageMeta({ layout: 'console-secret' })
useHead({ title: 'Admin' })
const service = useAccessService()
const { access, can } = useConsoleAccess()
const users = ref<AdminUser[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formOpen = ref(false)
const editing = ref<AdminUser | null>(null)
const deleting = ref<AdminUser | null>(null)
const keyword = ref('')
const page = ref(0)
const limit = ref(10)
const matches = computed(() => users.value.filter(u => `${u.name} ${u.email} ${u.role.name}`.toLowerCase().includes(keyword.value.toLowerCase())))
const rows = computed(() => matches.value.slice(page.value * limit.value, (page.value + 1) * limit.value))
watch([keyword, limit], () => { page.value = 0 })
const mayAssign = (role: Role) => access.value?.role.name === 'superadmin' || (role.name !== 'superadmin' && role.permission_ids.every(id => access.value?.permissions.some(p => p.id === id)))
const assignableRoles = computed(() => roles.value.filter(mayAssign))
const editable = (u: AdminUser) => u.id !== access.value?.user_id && (access.value?.role.name === 'superadmin' || u.role.name !== 'superadmin') && mayAssign(u.role)
const columns = adminColumns(u => { editing.value = u; formOpen.value = true }, u => { deleting.value = u }, u => can('admins.update') && editable(u), u => can('admins.delete') && editable(u))
const load = async () => {
  loading.value = true; error.value = ''
  try { const [a, r] = await Promise.all([service.admins(), service.roles()]); users.value = a.adminUsers; roles.value = r.roles }
  catch (e) { error.value = getErrorMessage(e) }
  finally { loading.value = false }
}
onMounted(load)
const save = async (input: AdminInput) => {
  saving.value = true
  try { await service.saveAdmin(editing.value?.id ?? null, input); formOpen.value = false; toast.success('Admin berhasil disimpan'); await load() }
  catch (e) { toast.error(getErrorMessage(e)) }
  finally { saving.value = false }
}
const remove = async () => {
  if (!deleting.value) return
  saving.value = true
  try { await service.deleteAdmin(deleting.value.id); deleting.value = null; page.value = 0; toast.success('Admin berhasil dihapus'); await load() }
  catch (e) { toast.error(getErrorMessage(e)) }
  finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <ElementsAppBreadcrumb />
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><h1 class="text-2xl font-bold">Admin</h1><p class="mt-1 text-sm text-muted-foreground">Kelola akun admin dan role yang menentukan aksesnya.</p></div>
      <UiButton v-if="can('admins.create')" :disabled="loading || saving" @click="editing = null; formOpen = true">Tambah admin</UiButton>
    </div>
    <FormsAdminForm v-if="formOpen" :key="editing?.id ?? 'new'" :admin="editing" :roles="assignableRoles" :saving="saving" @submit="save" @cancel="formOpen = false" />
    <FormsFieldsFieldXText v-model="keyword" name="search" label="Cari admin" placeholder="Nama, email, atau role" standalone />
    <div v-if="error" role="alert" class="rounded-xl border border-destructive p-4 text-destructive">{{ error }} <UiButton variant="outline" @click="load">Coba lagi</UiButton></div>
    <DatatablesDataTable v-else :columns="columns" :data="rows" :loading="loading" :pagination="{ page, limit, total: matches.length }" @page-change="page = $event" @limit-change="limit = $event" />
    <UiAlertDialog :open="!!deleting" @update:open="!$event && !saving && (deleting = null)">
      <UiAlertDialogContent><UiAlertDialogHeader><UiAlertDialogTitle>Hapus admin?</UiAlertDialogTitle><UiAlertDialogDescription>Akses akun {{ deleting?.email }} akan dicabut. Data akun tetap tersimpan sebagai arsip (soft delete).</UiAlertDialogDescription></UiAlertDialogHeader>
        <UiAlertDialogFooter><UiAlertDialogCancel :disabled="saving">Batal</UiAlertDialogCancel><UiAlertDialogAction :disabled="saving" @click.prevent="remove">{{ saving ? 'Menghapus…' : 'Hapus' }}</UiAlertDialogAction></UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
