<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FooterLink from './FooterLink.vue'
import FooterSection from './FooterSection.vue'
import { useFooterLinks } from '../../composables/useFooterLinks'
import fukharaLogoEn from '../../assets/logo/fukhara-logo.svg'
import fukharaLogoAr from '../../assets/logo/fukhara-logo-ar.svg'

const { t, locale } = useI18n()
const { about, privacy, openSource } = useFooterLinks()

const logo = computed(() => (locale.value === 'ar' ? fukharaLogoAr : fukharaLogoEn))
</script>

<template>
  <footer :aria-label="t('footer.ariaLabel')" class="mt-8 border-t border-[theme(colors.subtle)] bg-layer-01">
    <div class="page-shell grid grid-cols-1 border-subtle lg:grid-cols-3">
      <FooterSection>
        <img :src="logo" alt="Fukhara" class="h-[40px] w-auto self-start" >
        <p class="font-body text-body text-secondary">{{ t('footer.tagline') }}</p>
        <p class="font-body text-body text-secondary">{{ t('footer.builtBy') }}</p>
        <FooterLink v-for="item in about" :key="item.key" :link="item" />
      </FooterSection>

      <FooterSection :title="t('footer.dataTitle')">
        <p class="font-body text-body text-secondary">{{ t('footer.dataBody') }}</p>
        <FooterLink :link="privacy" />
      </FooterSection>

      <FooterSection :title="t('footer.openSourceTitle')">
        <p class="font-body text-body text-secondary">{{ t('footer.openSourceBody') }}</p>
        <FooterLink v-for="item in openSource" :key="item.key" :link="item" />
      </FooterSection>
    </div>
  </footer>
</template>
