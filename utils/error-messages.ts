// User-facing messages only: never display raw request URLs or methods.
export const ERROR_MESSAGES: Record<string, string> = {
  400: 'Permintaan tidak valid. Periksa kembali data yang dimasukkan.',
  401: 'Autentikasi gagal. Silakan masuk kembali.',
  403: 'Anda tidak memiliki izin untuk mengakses layanan ini.',
  404: 'Layanan yang diminta tidak ditemukan.',
  408: 'Permintaan terlalu lama. Silakan coba lagi.',
  409: 'Data bertentangan dengan data yang sudah ada.',
  422: 'Data belum sesuai. Periksa kembali isian Anda.',
  429: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
  500: 'Terjadi gangguan pada server. Silakan coba lagi nanti.',
  502: 'Server sementara tidak tersedia atau sedang dalam pemeliharaan. Silakan coba lagi nanti.',
  503: 'Layanan sementara tidak tersedia. Silakan coba lagi nanti.',
  504: 'Server terlalu lama merespons. Silakan coba lagi nanti.',
  INVALID_CREDENTIALS: 'Email atau password salah. Silakan coba lagi.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini.',
  UNAUTHENTICATED: 'Sesi tidak valid. Silakan masuk kembali.',
  ROLE_IN_USE: 'Role masih digunakan oleh user dan tidak dapat dihapus.',
  ROLE_ALREADY_EXISTS: 'Nama role sudah digunakan. Pilih nama lain.',
  EMAIL_ALREADY_EXISTS: 'Email sudah digunakan oleh akun lain.',
  ROLE_UNAVAILABLE: 'Pilih role yang aktif untuk admin.',
  SELF_ADMIN_CHANGE: 'Gunakan halaman profil untuk mengubah akun sendiri.',
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  TIMEOUT: 'Permintaan terlalu lama. Silakan coba lagi.',
  LOGIN_ENCRYPTION_UNAVAILABLE: 'Layanan login belum tersedia. Silakan coba lagi nanti.',
  INVALID_ENCRYPTED_CREDENTIALS: 'Permintaan login tidak valid atau kedaluwarsa. Silakan coba lagi.',
  UNKNOWN: 'Terjadi kesalahan. Silakan coba lagi nanti.',
}

export function getErrorMessage(error: unknown): string {
  // useGql preserves the original fetch error as its cause.
  let current = error
  for (let depth = 0; depth < 5; depth++) {
    if (!current || typeof current !== 'object') break
    const detail = current as {
      statusCode?: number
      status?: number
      response?: { status?: number }
      message?: string
      name?: string
      cause?: unknown
      code?: string
    }
    const status = detail.response?.status ?? detail.statusCode ?? detail.status
    if (detail.code && ERROR_MESSAGES[detail.code]) return ERROR_MESSAGES[detail.code]!
    if (status && status >= 400) {
      return ERROR_MESSAGES[String(status)] ?? ERROR_MESSAGES.UNKNOWN!
    }
    const message = typeof detail.message === 'string' ? detail.message : ''
    const loginMessage = message.replace(/^\[GQL\] Request failed: /, '').trim().toLowerCase()
    if (loginMessage === 'login encryption unavailable') return ERROR_MESSAGES.LOGIN_ENCRYPTION_UNAVAILABLE!
    if (loginMessage === 'invalid encrypted login credentials') return ERROR_MESSAGES.INVALID_ENCRYPTED_CREDENTIALS!
    if (message.replace(/^\[GQL\] Request failed: /, '').trim().toLowerCase() === 'invalid email or password') {
      return ERROR_MESSAGES.INVALID_CREDENTIALS!
    }
    if (detail.name === 'TimeoutError' || /timeout|timed out/i.test(message)) {
      return ERROR_MESSAGES.TIMEOUT!
    }
    if (/failed to fetch|fetch failed|network error|networkerror|<no response>/i.test(message)) {
      return ERROR_MESSAGES.NETWORK_ERROR!
    }
    current = detail.cause
  }
  return ERROR_MESSAGES.UNKNOWN!
}
