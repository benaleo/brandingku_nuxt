import { computed, toValue, type MaybeRefOrGetter } from 'vue'

type PageSeo = {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | null | undefined>
  // absolute url or a path under public/
  image?: MaybeRefOrGetter<string | null | undefined>
  type?: 'website' | 'article'
}

const DEFAULT_IMAGE = '/images/loading-logo.png'
const DESCRIPTION_MAX = 160
const NAMED_ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

// rich text arrives entity-encoded; the meta tag would otherwise show a literal &nbsp;
const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== '#') return NAMED_ENTITIES[e.toLowerCase()] ?? m
    const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
  })

// rich text (tags and entities) to a single plain line, for meta tags and structured data
export const toPlainText = (s?: string | null) =>
  decodeEntities((s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

// public origin for canonical and structured data urls; BASE_URL wins over the request host
export const useSiteOrigin = () => (useRuntimeConfig().public.BASE_URL || useRequestURL().origin).replace(/\/+$/, '')

// title, description, open graph/twitter card and canonical for a public page.
// canonical drops the query string so filters (?sub=, ?page=) don't split the ranking.
export const usePageSeo = (seo: PageSeo) => {
  const route = useRoute()
  const { locale } = useI18n()
  const origin = useSiteOrigin()

  const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`)
  const canonical = computed(() => `${origin}${route.path.replace(/\/+$/, '')}`)

  const description = computed(() => {
    const text = toPlainText(toValue(seo.description))
    return text.length > DESCRIPTION_MAX ? `${text.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : text
  })
  const image = computed(() => absolute(toValue(seo.image) || DEFAULT_IMAGE))

  useSeoMeta({
    title: () => toValue(seo.title),
    description: () => description.value || undefined,
    ogTitle: () => toValue(seo.title),
    ogDescription: () => description.value || undefined,
    ogType: seo.type || 'website',
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogSiteName: 'Brandingku',
    ogLocale: () => (locale.value === 'en' ? 'en_US' : 'id_ID'),
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(seo.title),
    twitterDescription: () => description.value || undefined,
    twitterImage: () => image.value,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
