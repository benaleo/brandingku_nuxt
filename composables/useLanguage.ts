export type AppLocale = 'id' | 'en'

// the visitor's language choice, kept a year in a cookie; without one everyone gets Indonesian
export const LANGUAGE_COOKIE = 'lang'
const ONE_YEAR = 60 * 60 * 24 * 365

export const useLanguage = () => {
  const { locale, setLocale } = useI18n()
  const cookie = useCookie<AppLocale | null>(LANGUAGE_COOKIE, { maxAge: ONE_YEAR, sameSite: 'lax' })
  const change = async (code: AppLocale) => {
    cookie.value = code
    await setLocale(code)
  }
  return { locale, change }
}
