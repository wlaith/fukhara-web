<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressBar from '~/components/ui/ProgressBar.vue'
import { useAnalysisProgress } from '~/composables/useAnalysisProgress'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'

definePageMeta({ name: 'analyzing' })

const { t } = useI18n()
const route = useRoute()
const { push } = useLocalizedNavigation()

const { stepLabel, percent, start, stop } = useAnalysisProgress(() => {
  push({ name: 'report', params: { id: route.params.id as string } })
}, t)

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <main class="page-shell flex  flex-col gap-4 border-subtle w-full">
    <div class="border-subtle p-6">
    <h1 class="font-heading text-display-lg text-primary">{{ t('analyzingView.title') }}</h1>
    <p class="font-body text-body text-secondary">{{ t('analyzingView.subtitle') }}</p>
    <ProgressBar
      :percent="percent"
      :label="stepLabel"
      :helper-text="t('analyzingView.helperText')"
    /></div>
  </main>
</template>
