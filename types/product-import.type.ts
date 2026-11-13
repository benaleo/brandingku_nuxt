// Shapes returned by the brandingku_go product import endpoints
// (`/import/products` and `/import/products/{job_id}`), proxied through
// `server/api/import.post.ts` and `server/api/import/[id].get.ts`.

export type ProductImportStatus = 'queued' | 'running' | 'done' | 'failed'

/** One row of the dry-run preview, before anything is written. */
export interface ProductImportPreviewRow {
  line: number
  code: string
  name: string
  category: string
  subcategory: string
  galleries: number
  brandings: number
}

/** 200 response of a dry run (`dry_run=1`). */
export interface ProductImportDryRun {
  sheet: string
  total: number
  preview: ProductImportPreviewRow[]
}

/** 202 response after a real upload: the backend job was queued. */
export interface ProductImportUpload {
  job_id: string
  status: ProductImportStatus
}

export type ProductImportAction = 'created' | 'updated' | 'failed'

/** One imported row in the final report. */
export interface ProductImportReportRow {
  line: number
  code: string
  name: string
  action: ProductImportAction
  message: string
}

export interface ProductImportReport {
  sheet: string
  total: number
  created: number
  updated: number
  failed: number
  images_uploaded: number
  images_failed: number
  duration_ms: number
  truncated: boolean
  rows: ProductImportReportRow[]
}

/** Status payload polled while the backend imports in the background. */
export interface ProductImportJob {
  id: string
  status: ProductImportStatus
  stage: string
  total: number
  processed: number
  created: number
  updated: number
  failed: number
  images_uploaded: number
  images_failed: number
  error: string
  started_at: string
  finished_at: string
  report: ProductImportReport | null
}

/** Input of `useProductImportService().upload()`. */
export interface ProductImportUploadInput {
  /** The `.xlsx` catalog; required. */
  catalog: File
  /** Optional `.zip` of product pictures. */
  images?: File | null
  /** `true` only validates the spreadsheet and returns a preview. */
  dryRun?: boolean
}

export interface ProductImportPollOptions {
  /** Delay between two status requests. Defaults to 1500 ms. */
  intervalMs?: number
  /** Stops the loop when aborted, e.g. from `onBeforeUnmount`. */
  signal?: AbortSignal
  /** Called once when a status request fails; the loop stops afterwards. */
  onError?: (error: unknown) => void
}

/** Returned by `poll()` so callers can stop it manually. */
export interface ProductImportPollHandle {
  stop: () => void
}
