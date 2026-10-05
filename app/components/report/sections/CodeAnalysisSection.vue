<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Tabs from '../../ui/Tabs.vue'
import ContainedList from '../../ui/ContainedList.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import { severityLabel, type Severity } from '../../../domain/severity'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.codeAnalysis.load()
})

const SEVERITY_TABS = computed<{ id: Severity; label: string }[]>(() => [
  { id: 'high', label: severityLabel('high', t) },
  { id: 'warning', label: severityLabel('warning', t) },
  { id: 'info', label: severityLabel('info', t) },
  { id: 'good', label: severityLabel('good', t) },
])

const SEVERITIES: readonly Severity[] = ['high', 'warning', 'info', 'good']

function isSeverity(value: string): value is Severity {
  return (SEVERITIES as readonly string[]).includes(value)
}

const activeSeverity = ref<Severity>('high')

function onSelectSeverity(id: string) {
  if (isSeverity(id)) {
    activeSeverity.value = id
  }
}

const categories = computed(() => {
  const vulnerabilities = report.codeAnalysis.data.value?.code_vulnerabilities
  if (!vulnerabilities) return []
  return Object.entries(vulnerabilities)
})

const filteredCategories = computed(() =>
  categories.value.filter(([, category]) => category?.metadata?.severity === activeSeverity.value),
)

const rows = computed(() =>
  filteredCategories.value.map(([key, category]) => ({
    id: key,
    title: category?.metadata?.cwe ?? key,
    meta: `${Object.values(category?.files ?? {})[0] ?? ''} · ${severityLabel(category?.metadata?.severity, t)} · CVSS ${category?.metadata?.cvss ?? '—'}`,
  })),
)

const listTitle = computed(() =>
  t('codeAnalysis.listTitle', { count: filteredCategories.value.length, total: categories.value.length }),
)
</script>

<template>
  <div>
    <p v-if="report.codeAnalysis.error.value" class="p-4 font-body text-body text-tag-red-border">
      {{ report.codeAnalysis.error.value }}
    </p>
    <Tabs :items="SEVERITY_TABS" :active-id="activeSeverity" @select="onSelectSeverity" />
    <ContainedList :title="listTitle" :rows="rows" />
  </div>
</template>
