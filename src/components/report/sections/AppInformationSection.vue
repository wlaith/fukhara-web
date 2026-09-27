<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import ContainedList from '../../ui/ContainedList.vue'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.appAnalysis.load()
})

const apkDetails = computed(() => report.appAnalysis.data.value?.apk_details)
const certificate = computed(() => report.appAnalysis.data.value?.certificate_details)

// manifest_analysis can come back as an object instead of an array — narrow to the array shape.
const manifestFindings = computed(() => {
  const raw = report.appAnalysis.data.value?.manifest_analysis
  return Array.isArray(raw) ? raw : []
})

// activities.all_activities can be nested one level deeper depending on the source — handle both.
const componentsSummary = computed(() => {
  const data = report.appAnalysis.data.value
  const allActivities = data?.activities?.all_activities
  const activityCount = Array.isArray(allActivities)
    ? allActivities.length
    : (allActivities?.all_activities?.length ?? 0)
  const receiverCount = data?.receivers?.length ?? 0
  const serviceCount = data?.services?.length ?? 0
  return t('appInformation.componentsSummary', { activities: activityCount, receivers: receiverCount, services: serviceCount })
})
</script>

<template>
  <div>
    <p v-if="report.appAnalysis.error.value" class="section-error p-4 font-body text-body text-tag-red-border">
      {{ report.appAnalysis.error.value }}
    </p>
    <ContainedList :title="t('appInformation.appDetailsTitle')" :rows="apkDetails ? [{ id: 'app-details', title: `${apkDetails.package} · ${apkDetails.app_name} · ${apkDetails.version_name} · SDK ${apkDetails.sdk}`, meta: '' }] : []" />
    <ContainedList :title="t('appInformation.certificateTitle')" :rows="certificate ? [{ id: 'certificate', title: t('appInformation.certificateSummary', { issuer: certificate.issuer, sha256: certificate.sha256, notBefore: certificate.not_before, notAfter: certificate.not_after }), meta: '' }] : []" />
    <ContainedList :title="t('appInformation.componentsTitle')" :rows="[{ id: 'components', title: componentsSummary, meta: '' }]" />
    <ContainedList :title="t('appInformation.manifestFindingsTitle')" :rows="manifestFindings.map((finding, index) => ({ id: index.toString(), title: `${finding.title} — ${finding.description}`, meta: t('appInformation.severityPrefix', { severity: finding.severity }) }))" />
    <!-- <DetailRow v-if="apkDetails" :icon-src="deviceUnknownIcon" icon-alt="App Details" label="App Details">
      {{ apkDetails.package }} · {{ apkDetails.app_name }} · {{ apkDetails.version_name }} · SDK {{ apkDetails.sdk }}
    </DetailRow>
    <DetailRow v-if="certificate" :icon-src="shieldIcon" icon-alt="Certificate" label="Certificate">
      Issuer: {{ certificate.issuer }} · SHA-256: {{ certificate.sha256 }} · Valid {{ certificate.not_before }} →
      {{ certificate.not_after }}
    </DetailRow>
    <DetailRow :icon-src="sourceIcon" icon-alt="Components" label="Components">
      {{ componentsSummary }}
    </DetailRow>
    <DetailRow
      v-for="(finding, index) in manifestFindings"
      :key="index"
      :icon-src="warningIcon"
      icon-alt="Manifest Finding"
      :label="`Manifest Finding — ${finding.severity}`"
    >
      {{ finding.title }} — {{ finding.description }}
    </DetailRow> -->
  </div>
</template>
