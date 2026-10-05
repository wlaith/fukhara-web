<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ContainedList from '../../ui/ContainedList.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.networkAnalysis.load()
})

const rows = computed(() => {
  const domains = report.networkAnalysis.data.value?.domains
  if (!domains) return []
  return Object.entries(domains).map(([name, info]) => ({
    id: name,
    title: name,
    meta: t('network.badLabel', { value: info?.bad ?? 'unknown' }),
  }))
})
</script>

<template>
  <p v-if="report.networkAnalysis.error.value" class="p-4 font-body text-body text-tag-red-border">
    {{ report.networkAnalysis.error.value }}
  </p>
  <ContainedList :title="t('network.domainsTitle')" :rows="rows" />
</template>
