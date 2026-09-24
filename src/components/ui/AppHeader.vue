<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Button from './Button.vue'
import { useLocalizedNavigation } from '../../composables/useLocalizedNavigation'
import fukharaLogoEn from '../../assets/logo/fukhara-logo.svg'
import fukharaLogoAr from '../../assets/logo/fukhara-logo-ar.svg'

defineEmits<{ analyze: [] }>()

const { t } = useI18n()
const route = useRoute()
const { push } = useLocalizedNavigation()

const isArabic = computed(() => route.params.locale === 'ar')
const logo = computed(() => (isArabic.value ? fukharaLogoAr : fukharaLogoEn))
const switchToLabel = computed(() => (isArabic.value ? 'English' : 'العربية'))
const isMenuOpen = ref(false)

function switchLocale() {
  if (isArabic.value) {
    push(route.fullPath.replace(/^\/ar(\/|$)/, '/'))
  } else {
    push(route.fullPath === '/' ? '/ar' : `/ar${route.fullPath}`)
  }
}
</script>

<template>
  <header class="page-shell relative flex h-fit items-center justify-between bg-panel">
    <img :src="logo" alt="Fukhara" class="h-[27.5px] w-auto" />

    <nav class="hidden items-center gap-2 lg:flex">
      <Button variant="secondary">{{ t('appHeader.about') }}</Button>
      <Button variant="secondary">{{ t('appHeader.documentation') }}</Button>
      <Button variant="secondary" @click="switchLocale">{{ switchToLabel }}</Button>
      <Button variant="primary" @click="$emit('analyze')">{{ t('appHeader.analyze') }}</Button>
    </nav>

    <div class="flex items-center gap-2 lg:hidden">
      <Button variant="primary" @click="$emit('analyze')">{{ t('appHeader.analyze') }}</Button>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center border-none bg-transparent text-primary cursor-pointer"
        :aria-label="t('appHeader.toggleMenu')"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div v-if="isMenuOpen" class="absolute inset-x-0 top-10 z-10 flex flex-col gap-2 bg-panel p-4 lg:hidden">
      <Button variant="secondary">{{ t('appHeader.about') }}</Button>
      <Button variant="secondary">{{ t('appHeader.documentation') }}</Button>
      <Button variant="secondary" @click="switchLocale">{{ switchToLabel }}</Button>
    </div>
  </header>
</template>
