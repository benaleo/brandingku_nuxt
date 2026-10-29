<script setup lang="ts">
import { toast } from 'vue-sonner'
import { LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useProfileService, type MyProfile } from '~/services/profile.service'

definePageMeta({ layout: 'console-secret' })
useHead({ title: 'Profile' })

const { access } = useConsoleAccess()
const service = useProfileService()

const loading = ref(true)
const saving = ref(false)
const profile = ref<MyProfile | null>(null)

const load = async () => {
  if (!access.value?.user_id) return
  loading.value = true
  try { profile.value = await service.myProfile(access.value.user_id).then(r => r.getUserDetail) }
  catch (e) { toast.error(getErrorMessage(e)) }
  finally { loading.value = false }
}
onMounted(load)

const logout = () => {
  useCookie('token').value = null
  window.location.href = '/'
}

const saveProfile = async (values: { name: string; phone?: string; address?: string; avatarFile: File | null }) => {
  if (!access.value?.user_id) return
  saving.value = true
  try {
    if (values.avatarFile) {
      const avatar = await useFileToBase64().convertToBase64(values.avatarFile)
      await service.updateAvatar(access.value.user_id, avatar)
    }
    await service.updateProfile(access.value.user_id, { name: values.name, phone: values.phone, address: values.address })
    toast.success('Profil berhasil diperbarui')
    await load()
  } catch (e) { toast.error(getErrorMessage(e)) }
  finally { saving.value = false }
}

const changingPassword = ref(false)
const passwordDialogOpen = ref(false)
const changePassword = async (newPassword: string) => {
  changingPassword.value = true
  try {
    await service.changePassword(newPassword)
    toast.success('Password berhasil diubah')
    passwordDialogOpen.value = false
  } catch (e) { toast.error(getErrorMessage(e)) }
  finally { changingPassword.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <ElementsAppBreadcrumb />
    <div class="flex items-start justify-between gap-3">
      <div><h1 class="text-2xl font-bold">Profile</h1><p class="mt-1 text-sm text-muted-foreground">Kelola informasi akun dan password Anda.</p></div>
      <!-- phones have no avatar menu, so logging out happens here -->
      <Button variant="outline" class="shrink-0 text-red-600 hover:text-red-700 min-[769px]:hidden" @click="logout">
        <LogOut class="size-4"/> Keluar
      </Button>
    </div>

    <FormsProfileForm v-if="!loading" :profile="profile" :saving="saving" @submit="saveProfile" />

    <FormsFormSection title="Password" description="Ubah password akun Anda secara terpisah dari data profil.">
      <FormsChangePasswordDialog v-model:open="passwordDialogOpen" :saving="changingPassword" @submit="changePassword" />
    </FormsFormSection>
  </div>
</template>
