<script setup lang="ts">
import AppFooter from './components/footer/AppFooter.vue'
import AppHeader from './components/ui/AppHeader.vue'
import { useLocalizedNavigation } from './composables/useLocalizedNavigation'

const { locale, localeProperties } = useI18n()
const { push } = useLocalizedNavigation()

useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: localeProperties.value.dir },
}))
</script>

<template>
  <AppHeader @analyze="push({ name: 'home' })" />
  <NuxtPage />
  <AppFooter />
</template>
