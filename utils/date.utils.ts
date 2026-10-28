const pad = (value: number) => String(value).padStart(2, '0')

export function formatDateTime(value: string | number | Date | null | undefined): string {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// "5 minutes ago" style text for recent times, a plain date after a week; null under a minute
export function formatRelativeTime(value: string, intlLocale: string): string | null {
    const date = new Date(value)
    const s = Math.round((Date.now() - date.getTime()) / 1000)
    if (s < 60) return null
    const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' })
    if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute')
    if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour')
    if (s < 604800) return rtf.format(-Math.round(s / 86400), 'day')
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium' }).format(date)
}
