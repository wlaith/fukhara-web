<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SubVerdictCard from './SubVerdictCard.vue'
import { useSubVerdicts } from '../../composables/useSubVerdicts'
import type { ReportContext } from '../../composables/useReport'

const props = defineProps<{ report: ReportContext }>()
defineEmits<{ select: [sectionId: string] }>()

const { t } = useI18n()
const subVerdicts = useSubVerdicts(props.report, t)

const cards = computed(() =>
  [
    { id: 'code-analysis', label: t('reportView.tabs.codeAnalysis'), subVerdict: subVerdicts.codeAnalysis.value },
    { id: 'behavior-analysis', label: t('reportView.tabs.behaviorAnalysis'), subVerdict: subVerdicts.behaviorAnalysis.value },
    { id: 'app-information', label: t('reportView.tabs.appInformation'), subVerdict: subVerdicts.appInformation.value },
    { id: 'threat-intelligence', label: t('reportView.tabs.threatIntelligence'), subVerdict: subVerdicts.threatIntelligence.value },
    { id: 'network', label: t('reportView.tabs.network'), subVerdict: subVerdicts.network.value },
    { id: 'fingerprints', label: t('reportView.tabs.fingerprints'), subVerdict: subVerdicts.fingerprints.value },
  ].flatMap((card) => (card.subVerdict ? [{ ...card, subVerdict: card.subVerdict }] : [])),
)
</script>

<template>
  <div class="grid grid-cols-1 border-subtle md:grid-cols-2 lg:grid-cols-3">
    <SubVerdictCard
      v-for="card in cards"
      :key="card.id"
      :label="card.label"
      :sub-verdict="card.subVerdict"
      @select="$emit('select', card.id)"
    />
  </div>
</template>
