<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '../ui/Tag.vue'
import { verdictSeverityKind } from '../../domain/severity'

const props = defineProps<{ verdict: string; severity: string; reason: string; response: string }>()

const { t } = useI18n()
const kind = computed(() => verdictSeverityKind(props.severity))
const severityTagLabel = computed(() => {
  const map: Record<string, string> = {
    high: t('verdictBanner.severityTag.high'),
    medium: t('verdictBanner.severityTag.medium'),
    low: t('verdictBanner.severityTag.low'),
  }
  return map[props.severity?.toLowerCase()] ?? `${props.severity} ${t('verdictBanner.severitySuffixFallback')}`
})

const headlineBg = computed(() => {
  switch (kind.value) {
    case 'red':
      return 'bg-tag-red-bg'
    case 'gold':
      return 'bg-tag-gold-bg'
    case 'green':
      return 'bg-tag-green-bg'
    case 'gray':
    default:
      return 'bg-tag-gray-bg'
  }
})

const verdictText = computed(() => {
  switch (kind.value) {
    case 'red':
      return 'text-tag-red-text'
    case 'gold':
      return 'text-tag-gold-text'
    case 'green':
      return 'text-tag-green-text'
    case 'gray':
    default:
      return 'text-tag-gray-text'
  }
})
</script>

<template>
  <section class="w-full border-subtle">
    <div class="flex border-subtle items-center justify-between p-5" :class="[`verdict-banner__headline--${kind}`, headlineBg]">
      <h1 class="font-heading text-display-lg" :class="verdictText">
        {{ verdict }}
      </h1>
      <Tag :kind="kind">{{ severityTagLabel }}</Tag>
    </div>
    <div class="flex gap-6 p-5 border-subtle">
      <div class="flex flex-1 flex-col gap-2">
        <p class="font-body text-eyebrow font-semibold text-primary">{{ t('verdictBanner.reason') }}</p>
        <p class="font-body text-body text-primary">{{ reason }}</p>
      </div>
      <div class="flex flex-1 flex-col gap-2 ">
        <p class="font-body text-eyebrow font-semibold text-primary">{{ t('verdictBanner.recommendedResponse') }}</p>
        <p class="font-body text-body text-primary">{{ response }}</p>
      </div>
    </div>
  </section>
</template>
