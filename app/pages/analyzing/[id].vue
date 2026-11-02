<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AnalysisFlow from '~/components/analyzing/AnalysisFlow.vue'
import { getAnalysisStatus } from '~/api/reportApi'
import { useAnalysisProgress } from '~/composables/useAnalysisProgress'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'
import { withKnownTools } from '~/domain/analysisTools'

definePageMeta({ name: 'analyzing' })

const COMPLETE_PAUSE_MS = 600

const { t, te } = useI18n()
const route = useRoute()
const { push } = useLocalizedNavigation()

const id = route.params.id as string
let completeTimer: ReturnType<typeof setTimeout> | undefined

const { toolsDone, toolsTotal, percent, elapsedSeconds, error, start, stop } = useAnalysisProgress(
  () => {
    completeTimer = setTimeout(() => push({ name: 'report', params: { id } }), COMPLETE_PAUSE_MS)
  },
  t,
  () => getAnalysisStatus(id),
)

const complete = computed(() => toolsTotal.value > 0 && toolsDone.value.length >= toolsTotal.value)
const progressLabel = computed(() => t('analyzingView.progress', { done: toolsDone.value.length, total: toolsTotal.value }))
const elapsedLabel = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
  return t('analyzingView.elapsed', { time: `${minutes}:${seconds}` })
})
const tools = computed(() =>
  withKnownTools(toolsDone.value).map((tool) => ({
    id: tool,
    label: te(`analyzingView.tools.${tool}`) ? t(`analyzingView.tools.${tool}`) : tool,
    done: toolsDone.value.includes(tool),
  })),
)
const finishedTools = computed(() => tools.value.filter((tool) => tool.done))

onMounted(start)
onBeforeUnmount(() => {
  stop()
  clearTimeout(completeTimer)
})
</script>

<template>
  <main class="page-shell flex w-full flex-col gap-4 border-subtle">
    <div class="flex flex-col gap-6 border-subtle p-6">
      <div class="flex flex-col gap-2">
        <h1 class="font-heading text-display-lg text-primary">{{ t('analyzingView.title') }}</h1>
        <p class="font-body text-body text-secondary">{{ t('analyzingView.subtitle') }}</p>
      </div>
      <AnalysisFlow
        :tools="tools"
        :percent="percent"
        :complete="complete"
        :source-label="t('analyzingView.source')"
        :report-label="t('analyzingView.report')"
        :progress-label="progressLabel"
      />
      <p class="font-body text-label tracking-label text-helper" role="status">{{ progressLabel }} · {{ elapsedLabel }}</p>
      <div class="sr-only">
        <h2>{{ t('analyzingView.finished') }}</h2>
        <ul>
          <li v-for="tool in finishedTools" :key="tool.id">{{ tool.label }}</li>
        </ul>
      </div>
      <p class="font-body text-label tracking-label text-helper">{{ t('analyzingView.helperText') }}</p>
      <p v-if="error" role="alert" class="font-body text-body text-tag-red-border">{{ error }}</p>
    </div>
  </main>
</template>
