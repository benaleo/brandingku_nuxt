import { toast } from 'vue-sonner'

export const notifyFormValidationError = ({ errors }: { errors: Record<string, string | undefined> }) => {
  toast.error('Periksa kembali form', {
    description: Object.values(errors).find(Boolean) || 'Lengkapi semua kolom yang wajib diisi.',
  })
}
