import { computed } from 'vue'
import { useGql } from './useGql'

// fallbacks keep the footer/contact page meaningful if the API is slow or down
const DEFAULTS: Record<string, string> = {
    CONTACT_PHONE: '+62 851 1724 7345',
    CONTACT_WHATSAPP: '6285117247345',
    CONTACT_EMAIL: 'admin@brandingku.com',
    CONTACT_ADDRESS: 'Jl. Merchandise Raya No. 42, Jakarta Selatan, Indonesia',
    CONTACT_HOURS: 'Senin - Jumat, 08.00 - 17.00 WIB',
    CONTACT_MAPS_URL: '',
}

// Public site settings (Options menu). Fetched with useAsyncData so the values are
// rendered server-side (visible to crawlers) and shared by every component on the page.
export const useSiteSettings = () => {
    const { gqlFetch } = useGql()
    const { data } = useAsyncData('site-settings', async () => {
        try {
            const res = await gqlFetch<{ getPublicSettings: { key: string; value: string }[] }>(
                `query getPublicSettings { getPublicSettings { key value } }`,
                {},
                { timeout: 8000 },
            )
            return Object.fromEntries((res?.getPublicSettings || []).map(s => [s.key, s.value]))
        } catch {
            return {}
        }
    }, { default: () => ({}) as Record<string, string> })

    const get = (key: string) => computed(() => (data.value?.[key] ?? '').trim() || DEFAULTS[key] || '')

    const phone = get('CONTACT_PHONE')
    const whatsapp = get('CONTACT_WHATSAPP')
    const email = get('CONTACT_EMAIL')
    const address = get('CONTACT_ADDRESS')
    const hours = get('CONTACT_HOURS')
    const mapsUrl = computed(() => (data.value?.CONTACT_MAPS_URL ?? '').trim())

    const phoneHref = computed(() => `tel:${phone.value.replace(/[^0-9+]/g, '')}`)
    const emailHref = computed(() => `mailto:${email.value}`)

    return { phone, whatsapp, email, address, hours, mapsUrl, phoneHref, emailHref }
}
