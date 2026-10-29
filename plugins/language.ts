import { LANGUAGE_COOKIE } from '~/composables/useLanguage'

// Browser language detection is off, so pages start in Indonesian (the default locale); a
// visitor who picked English gets it back from their cookie, on the server and the client alike.
export default defineNuxtPlugin({
  name: 'language-from-cookie',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    const saved = useCookie<string | null>(LANGUAGE_COOKIE).value
    const i18n = nuxtApp.$i18n as { locale: { value: string }; setLocale: (code: 'id' | 'en') => Promise<void> }
    if (saved === 'en' && i18n.locale.value !== 'en') await i18n.setLocale('en')
  },
})
