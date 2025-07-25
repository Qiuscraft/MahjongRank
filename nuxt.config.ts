// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/ArcticonsMahjonggbuilder.svg'
        }
      ]
    }
  },
  modules: [
    'nuxt-mongoose',
    '@element-plus/nuxt',
    '@nuxt/content',
  ],
  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: 'models',
    devtools: true,
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD || 'admin'
  }
})
