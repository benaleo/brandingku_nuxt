const pad = (value: number) => String(value).padStart(2, '0')

// Dates are shown the Indonesian way, dd-mm-yyyy and dd-mm-yyyy HH:mm:ss on a 24-hour clock, in
// WIB so server and browser render the same text.
const jakarta = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})
const jakartaParts = (date: Date) => {
    const p = Object.fromEntries(jakarta.formatToParts(date).map(x => [x.type, x.value]))
    return { d: p.day, m: p.month, y: p.year, time: `${p.hour}:${p.minute}:${p.second}` }
}

const toDate = (value: string | number | Date | null | undefined) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

// a moment (timestamps from the API): dd-mm-yyyy HH:mm:ss
export function formatDateTime(value: string | number | Date | null | undefined): string {
    const date = toDate(value)
    if (!date) return '-'
    const { d, m, y, time } = jakartaParts(date)
    return `${d}-${m}-${y} ${time}`
}

// the day of a moment: dd-mm-yyyy
export function formatDay(value: string | number | Date | null | undefined): string {
    const date = toDate(value)
    if (!date) return '-'
    const { d, m, y } = jakartaParts(date)
    return `${d}-${m}-${y}`
}

// a calendar date without a time (yyyy-mm-dd, as invoice dates are sent): dd-mm-yyyy, never shifted by a zone
export function formatDateOnly(value: string | null | undefined): string {
    const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
    return match ? `${match[3]}-${match[2]}-${match[1]}` : value || '-'
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
    return formatDay(date)
}

// --- input values: what <DateTimeInput> takes and gives

// yyyy-mm-dd or yyyy-mm-ddTHH:mm:ss (local time) -> dd-mm-yyyy[ HH:mm:ss]
export function inputValueToText(value: string, withTime: boolean): string {
    const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/)
    if (!match) return ''
    const day = `${match[3]}-${match[2]}-${match[1]}`
    return withTime ? `${day} ${match[4] ?? '00'}:${match[5] ?? '00'}:${match[6] ?? '00'}` : day
}

// dd-mm-yyyy[ HH:mm[:ss]] typed by a person -> the input value, null when it is not a real date/time
export function textToInputValue(text: string, withTime: boolean): string | null {
    const match = text.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?$/)
    if (!match) return null
    const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])]
    const [hh, mm, ss] = [Number(match[4] ?? 0), Number(match[5] ?? 0), Number(match[6] ?? 0)]
    const check = new Date(y, m - 1, d)
    if (check.getFullYear() !== y || check.getMonth() !== m - 1 || check.getDate() !== d || hh > 23 || mm > 59 || ss > 59) return null
    if (!withTime && match[4] !== undefined) return null
    const day = `${y}-${pad(m)}-${pad(d)}`
    return withTime ? `${day}T${pad(hh)}:${pad(mm)}:${pad(ss)}` : day
}
