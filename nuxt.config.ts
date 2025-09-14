// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/apollo',
    '@nuxthub/core'
  ],

  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
  },

  apollo: {
    clients: {
      default: {
        // Route all GraphQL requests through our server proxy to handle auth/cookies and avoid CORS
        httpEndpoint: '/api/gql'
      }
    },
  },
  
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '-mode',
    storage: 'localStorage', // or 'sessionStorage' or 'cookie'
    storageKey: 'nuxt-color-mode'
  },
  runtimeConfig: {
    apiSecret: '',
    public: {
      BASE_URL: process.env.NUXT_PUBLIC_BASE_URL || '',
      API_URL: process.env.NUXT_PUBLIC_API_URL || '',
      STORAGE_URL: process.env.NUXT_PUBLIC_STORAGE_URL || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || '',
    }
  }
})