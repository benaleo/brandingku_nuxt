import { computed } from 'vue'

// Organization + WebSite structured data with the contact details from the console Options menu.
// Rendered on the home page (where search engines look for it) and the contact page.
export const useOrganizationSchema = () => {
  const { phone, email, address } = useSiteSettings()
  const origin = useSiteOrigin()

  useHead({
    script: [{
      type: 'application/ld+json',
      key: 'organization-schema',
      innerHTML: computed(() => JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Brandingku',
          url: origin,
          logo: `${origin}/images/loading-logo.png`,
          email: email.value,
          telephone: phone.value,
          address: { '@type': 'PostalAddress', streetAddress: address.value, addressCountry: 'ID' },
          contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: phone.value, email: email.value, availableLanguage: ['Indonesian', 'English'] }],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: 'Brandingku',
          url: origin,
          inLanguage: 'id-ID',
          publisher: { '@id': `${origin}/#organization` },
        },
      ]).replace(/</g, '\\u003c')),
    }],
  })
}
