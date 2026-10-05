export default defineNuxtConfig({
  compatibilityDate: '2025-02-17',
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@nuxt/eslint'],

  css: ['~/assets/css/fonts.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  ignore: ['**/*.spec.ts'],

  app: {
    head: {
      title: 'Fukhara',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/globals.css',
    viewer: false,
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    langDir: 'locales',
    locales: [
      { code: 'en', language: 'en', name: 'English', dir: 'ltr', file: 'en.json' },
      { code: 'ar', language: 'ar', name: 'العربية', dir: 'rtl', file: 'ar.json' },
    ],
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      useMock: true,
      ciBuildNumber: '',
      ciBuildLink: '',
      ciCommitSha: '',
      ciCommitLink: '',
      buildRepoLink: '',
      buildTimestamp: '',
    },
  },
})
