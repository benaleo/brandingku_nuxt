import type {
  ProductImportDryRun,
  ProductImportJob,
  ProductImportPollHandle,
  ProductImportPollOptions,
  ProductImportUpload,
  ProductImportUploadInput,
} from '~/types/product-import.type'

const IMPORT_ENDPOINT = '/api/import'

/**
 * Uploads a product spreadsheet (plus an optional picture ZIP) through the local
 * Nitro proxy and polls the backend job until it finishes. Everything goes to
 * `/api/import*` on this origin — never to the API origin directly.
 */
export const useProductImportService = () => {
  // Dry run: 200 with the sheet summary and a preview of the first rows.
  function upload(input: ProductImportUploadInput & { dryRun: true }): Promise<ProductImportDryRun>
  // Real import: 202 with the queued job.
  function upload(input: ProductImportUploadInput & { dryRun?: false }): Promise<ProductImportUpload>
  // Callers that decide at runtime get the union and narrow on `job_id`.
  function upload(input: ProductImportUploadInput): Promise<ProductImportDryRun | ProductImportUpload>
  async function upload(input: ProductImportUploadInput): Promise<ProductImportDryRun | ProductImportUpload> {
    const form = new FormData()
    form.append('catalog', input.catalog, input.catalog.name)
    if (input.images) form.append('images', input.images, input.images.name)
    if (input.dryRun) form.append('dry_run', '1')

    return await $fetch<ProductImportDryRun | ProductImportUpload>(IMPORT_ENDPOINT, {
      method: 'POST',
      body: form,
      timeout: 600000,
      retry: 0,
      responseType: 'json',
    })
  }

  const status = async (id: string): Promise<ProductImportJob> =>
    await $fetch<ProductImportJob>(`${IMPORT_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'GET',
      timeout: 30000,
      retry: 0,
      responseType: 'json',
    })

  /**
   * Polls `status(id)` every ~1.5s and calls `onUpdate` with each snapshot.
   * Stops on `done`/`failed`, on abort, or when `stop()` is called. Returns a
   * handle so the page can stop it in `onBeforeUnmount`.
   */
  const poll = (
    id: string,
    onUpdate: (job: ProductImportJob) => void,
    options: ProductImportPollOptions = {},
  ): ProductImportPollHandle => {
    const intervalMs = options.intervalMs ?? 3000
    const maxFailures = options.maxConsecutiveFailures ?? 8
    let stopped = false
    let failures = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const stop = () => {
      stopped = true
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      options.signal?.removeEventListener('abort', stop)
    }

    if (options.signal?.aborted) return { stop }
    options.signal?.addEventListener('abort', stop, { once: true })

    const statusCodeOf = (error: unknown): number =>
      Number((error as { statusCode?: number; status?: number; response?: { status?: number } } | null)?.statusCode
        ?? (error as { status?: number } | null)?.status
        ?? (error as { response?: { status?: number } } | null)?.response?.status
        ?? 0)

    const run = async () => {
      if (stopped) return
      try {
        const job = await status(id)
        failures = 0
        if (stopped) return
        onUpdate(job)
        if (job.status === 'done' || job.status === 'failed') {
          stop()
          return
        }
      } catch (error) {
        if (stopped) return
        // A missing job means the API restarted (jobs live in memory); retrying cannot help.
        if (statusCodeOf(error) === 404) {
          stop()
          options.onError?.(new Error(
            'Status impor hilang karena server API restart. Impor bersifat idempoten: data yang sudah masuk tetap ada, jalankan ulang file yang sama untuk melanjutkan.',
          ))
          return
        }
        failures++
        if (failures > maxFailures) {
          stop()
          options.onError?.(new Error(
            'Gagal memantau status impor. Impor mungkin masih berjalan di server — cek daftar produk beberapa saat lagi, atau jalankan ulang file yang sama (tidak akan duplikat).',
          ))
          return
        }
      }
      // back off on failures so a slow API is not hammered, then resume normal cadence
      const delay = failures > 0 ? Math.min(intervalMs * 2 ** failures, 10000) : intervalMs
      if (!stopped) timer = setTimeout(run, delay)
    }

    void run()
    return { stop }
  }

  return { upload, status, poll }
}
