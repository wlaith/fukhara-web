<script setup lang="ts">
import { computed, provide, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'
import VerdictBanner from '~/components/report/VerdictBanner.vue'
import SubVerdictGrid from '~/components/report/SubVerdictGrid.vue'
import VerticalTabs from '~/components/ui/VerticalTabs.vue'
import BehaviorAnalysisSection from '~/components/report/sections/BehaviorAnalysisSection.vue'
import AppInformationSection from '~/components/report/sections/AppInformationSection.vue'
import ThreatIntelligenceSection from '~/components/report/sections/ThreatIntelligenceSection.vue'
import NetworkSection from '~/components/report/sections/NetworkSection.vue'
import FingerprintsSection from '~/components/report/sections/FingerprintsSection.vue'
import CodeAnalysisSection from '~/components/report/sections/CodeAnalysisSection.vue'
import { useReport, REPORT_INJECTION_KEY } from '~/composables/useReport'
import { useRecentReports } from '~/composables/useRecentReports'
import { formatTimestamp } from '~/domain/format'
import { toTimeline } from '~/domain/threatIntelligence'

definePageMeta({
  name: 'report',
  key: (route) => String(route.params.id),
})

const { t, locale } = useI18n()
const route = useRoute()
const { replace } = useLocalizedNavigation()

const report = useReport(route.params.id as string)
provide(REPORT_INJECTION_KEY, report)

const apkDetails = computed(() => report.appAnalysis.data.value?.apk_details)
const verdict = computed(() => report.verdict.data.value)
const analyzedAt = computed(() => {
  const upload = toTimeline(report.threatIntelligence.data.value?.sample_timeline).find((event) => event.key === 'upload_on_fukhara')
  return upload ? formatTimestamp(upload.value, locale.value) : undefined
})

const { remember } = useRecentReports()
watch(
  () => [report.verdict.data.value, apkDetails.value] as const,
  ([verdict, details]) => {
    if (!verdict?.verdict) return
    remember({
      id: route.params.id as string,
      appName: details?.app_name ?? details?.package ?? (route.params.id as string),
      verdict: verdict.verdict,
      severity: verdict.severity ?? null,
    })
  },
  { immediate: true },
)

const TABS = computed(() => [
  { id: 'code-analysis', label: t('reportView.tabs.codeAnalysis') },
  { id: 'behavior-analysis', label: t('reportView.tabs.behaviorAnalysis') },
  { id: 'app-information', label: t('reportView.tabs.appInformation') },
  { id: 'threat-intelligence', label: t('reportView.tabs.threatIntelligence') },
  { id: 'network', label: t('reportView.tabs.network') },
  { id: 'fingerprints', label: t('reportView.tabs.fingerprints') },
])

const SECTION_COMPONENTS: Record<string, unknown> = {
  'behavior-analysis': BehaviorAnalysisSection,
  'app-information': AppInformationSection,
  'threat-intelligence': ThreatIntelligenceSection,
  'network': NetworkSection,
  'fingerprints': FingerprintsSection,
  'code-analysis': CodeAnalysisSection,
}

const activeSection = computed(() => (route.params.section as string) || 'code-analysis')
const activeComponent = computed(() => SECTION_COMPONENTS[activeSection.value] ?? null)

const sections = useTemplateRef<HTMLElement>('sections')

function onSelectTab(id: string) {
  replace({ name: 'report', params: { id: route.params.id, section: id } })
}

function onSelectCard(id: string) {
  onSelectTab(id)
  sections.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <main class="flex flex-col ">
    <VerdictBanner
      v-if="verdict?.verdict"
      class="page-shell border-subtle"
      :verdict="verdict.verdict ?? undefined"
      :severity="verdict.severity ?? undefined"
      :reason="verdict.reason ?? undefined"
      :response="verdict.response ?? undefined"
      :app-name="apkDetails?.app_name ?? undefined"
      :package-name="apkDetails?.package ?? undefined"
      :version="apkDetails?.version_name ?? undefined"
      :analyzed-at="analyzedAt"
    />
    <div v-else-if="!report.verdict.error.value" class="page-shell border-subtle p-5" role="status" aria-busy="true">
      <span class="sr-only">{{ t('common.loading') }}</span>
      <span class="block h-4 w-1/3 animate-pulse bg-panel motion-reduce:animate-none" aria-hidden="true" />
      <span class="mt-4 block h-10 w-1/2 animate-pulse bg-panel motion-reduce:animate-none" aria-hidden="true" />
    </div>
    <SubVerdictGrid class="page-shell border-subtle" :report="report" @select="onSelectCard" />
    <div ref="sections" class="page-shell flex scroll-mt-4 flex-col border-subtle box-content lg:flex-row">
      <VerticalTabs :items="TABS" :active-id="activeSection" @select="onSelectTab" />
      <div class="flex-1  border-subtle w-full text-wrap">
        <component :is="activeComponent" v-if="activeComponent" />
      </div>
    </div>
  </main>
</template>
