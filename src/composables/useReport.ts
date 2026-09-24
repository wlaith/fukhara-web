import { ref, type InjectionKey, type Ref } from 'vue'
import {
  getVerdict,
  getFingerprints,
  getThreatIntelligence,
  getAppAnalysis,
  getCodeAnalysis,
  getBehaviorAnalysis,
  getNetworkAnalysis,
} from '../api/reportApi'

interface Section<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  load: () => Promise<void>
}

function createSection<T>(fetcher: () => Promise<T>): Section<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)
  let loaded = false

  async function load() {
    if (loaded || loading.value) return
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
      loaded = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}

export function useReport(id: string) {
  return {
    verdict: createSection(() => getVerdict(id)),
    fingerprints: createSection(() => getFingerprints(id)),
    threatIntelligence: createSection(() => getThreatIntelligence(id)),
    appAnalysis: createSection(() => getAppAnalysis(id)),
    codeAnalysis: createSection(() => getCodeAnalysis(id)),
    behaviorAnalysis: createSection(() => getBehaviorAnalysis(id)),
    networkAnalysis: createSection(() => getNetworkAnalysis(id)),
  }
}

export type ReportContext = ReturnType<typeof useReport>
export const REPORT_INJECTION_KEY: InjectionKey<ReportContext> = Symbol('report')
