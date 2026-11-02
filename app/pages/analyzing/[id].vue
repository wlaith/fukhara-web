<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressBar from '~/components/ui/ProgressBar.vue'
import Icon from '~/components/ui/Icon.vue'
import { getAnalysisStatus } from '~/api/reportApi'
import { useAnalysisProgress } from '~/composables/useAnalysisProgress'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'
import checkmarkFilledIcon from '~/assets/icons/checkmark--filled.svg'

definePageMeta({ name: 'analyzing' })

const { t, te } = useI18n()
const route = useRoute()
const { push } = useLocalizedNavigation()

const id = route.params.id as string

const { toolsDone, toolsTotal, percent, elapsedSeconds, error, start, stop } = useAnalysisProgress(
  () => {
    push({ name: 'report', params: { id } })
  },
  t,
  () => getAnalysisStatus(id),
)

const progressLabel = computed(() => t('analyzingView.progress', { done: toolsDone.value.length, total: toolsTotal.value }))
const elapsedLabel = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
  return t('analyzingView.elapsed', { time: `${minutes}:${seconds}` })
})
const finishedTools = computed(() =>
  toolsDone.value.map((tool) => ({
    id: tool,
    label: te(`analyzingView.tools.${tool}`) ? t(`analyzingView.tools.${tool}`) : tool,
  })),
)

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <main class="page-shell flex w-full flex-col gap-4 border-subtle">
    <div class="flex flex-col gap-4 border-subtle p-6">
      <h1 class="font-heading text-display-lg text-primary">{{ t('analyzingView.title') }}</h1>
      <p class="font-body text-body text-secondary">{{ t('analyzingView.subtitle') }}</p>
      <ProgressBar :percent="percent" :label="progressLabel" :helper-text="elapsedLabel" />
      <div v-if="finishedTools.length" class="flex flex-col gap-2">
        <h2 class="font-body text-label tracking-label text-helper">{{ t('analyzingView.finished') }}</h2>
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li v-for="tool in finishedTools" :key="tool.id" class="flex items-center gap-2 font-body text-body text-primary">
            <Icon :src="checkmarkFilledIcon" />
            {{ tool.label }}
          </li>
        </ul>
      </div>
      <p class="font-body text-label tracking-label text-helper">{{ t('analyzingView.helperText') }}</p>
      <p v-if="error" role="alert" class="font-body text-body text-tag-red-border">{{ error }}</p>
    </div>
  </main>
</template>
