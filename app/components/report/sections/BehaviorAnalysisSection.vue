<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ContainedList from '../../ui/ContainedList.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import { permissionStatusLabel } from '../../../domain/severity'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.behaviorAnalysis.load()
})

const rows = computed(() => {
  const permissions = report.behaviorAnalysis.data.value?.permissions
  if (!permissions) return []
  return Object.entries(permissions).map(([name, info]) => ({
    id: name,
    title: name,
    meta: `${permissionStatusLabel(info?.status ?? 'unknown', t)} · ${info?.info ?? ''}`,
  }))
})
</script>

<template>
  <p v-if="report.behaviorAnalysis.error.value" class="section-error p-4 font-body text-body text-tag-red-border">
    {{ report.behaviorAnalysis.error.value }}
  </p>
  <ContainedList :title="t('behaviorAnalysis.permissionsTitle')" :rows="rows" />
</template>
