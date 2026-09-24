<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ContainedList from '../../ui/ContainedList.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.threatIntelligence.load()
})

const rows = computed(() => {
  const matches = report.threatIntelligence.data.value?.yara_matches?.matches
  if (!matches) return []
  return matches.map((match, index) => ({
    id: `${match.source ?? 'unknown'}-${index}`,
    title: (match.rules ?? []).join(', '),
    meta: match.source ?? '',
  }))
})
</script>

<template>
  <p v-if="report.threatIntelligence.error.value" class="p-4 font-body text-body text-tag-red-border">
    {{ report.threatIntelligence.error.value }}
  </p>
  <ContainedList :title="t('threatIntelligence.yaraMatchesTitle')" :rows="rows" />
</template>
