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
    const intervalMs = options.intervalMs ?? 1500
    let stopped = false
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

    const run = async () => {
      if (stopped) return
      try {
        const job = await status(id)
        if (stopped) return
        onUpdate(job)
        if (job.status === 'done' || job.status === 'failed') {
          stop()
          return
        }
      } catch (error) {
        if (stopped) return
        stop()
        options.onError?.(error)
        return
      }
      if (!stopped) timer = setTimeout(run, intervalMs)
    }

    void run()
    return { stop }
  }

  return { upload, status, poll }
}
