import { computed } from 'vue'
import type { ReportContext } from './useReport'
import type { Severity, PermissionStatus } from '../domain/severity'
import type { ApkidFileMatches } from '../domain/subVerdicts'
import {
  codeAnalysisSubVerdict,
  behaviorAnalysisSubVerdict,
  appInformationSubVerdict,
  threatIntelligenceSubVerdict,
  networkSubVerdict,
  fingerprintsSubVerdict,
} from '../domain/subVerdicts'

interface CodeVulnerabilityCategoryRaw {
  metadata?: { severity?: Severity | null } | null
}

interface PermissionRaw {
  status?: PermissionStatus | null
}

interface ManifestFindingRaw {
  severity?: Severity | null
}

interface DomainRaw {
  bad?: string | null
  ofac?: boolean | null
}

export function useSubVerdicts(report: ReportContext) {
  const codeAnalysis = computed(() => {
    const data = report.codeAnalysis.data.value as {
      code_vulnerabilities?: Record<string, CodeVulnerabilityCategoryRaw> | null
    } | null
    if (!data?.code_vulnerabilities) return null
    const categories = Object.values(data.code_vulnerabilities).map((v) => ({
      severity: v?.metadata?.severity ?? null,
    }))
    return codeAnalysisSubVerdict(categories)
  })

  const behaviorAnalysis = computed(() => {
    const data = report.behaviorAnalysis.data.value as {
      permissions?: Record<string, PermissionRaw> | null
    } | null
    if (!data?.permissions) return null
    const permissions = Object.values(data.permissions).map((p) => ({ status: p?.status ?? null }))
    return behaviorAnalysisSubVerdict(permissions)
  })

  const appInformation = computed(() => {
    const data = report.appAnalysis.data.value as {
      manifest_analysis?: ManifestFindingRaw[] | null
    } | null
    if (!data?.manifest_analysis) return null
    const findings = data.manifest_analysis.map((f) => ({ severity: f?.severity ?? null }))
    return appInformationSubVerdict(findings)
  })

  const threatIntelligence = computed(() => {
    const data = report.threatIntelligence.data.value as {
      yara_matches?: { matches?: { rules?: string[] }[] } | null
      av_detections?: unknown[] | Record<string, number> | null
    } | null
    if (!data) return null
    const yaraCount = (data.yara_matches?.matches ?? []).reduce(
      (sum, m) => sum + (m.rules?.length ?? 0),
      0,
    )
    const avCount = Array.isArray(data.av_detections)
      ? data.av_detections.length
      : Object.keys(data.av_detections ?? {}).length
    return threatIntelligenceSubVerdict(yaraCount, avCount)
  })

  const network = computed(() => {
    const data = report.networkAnalysis.data.value as {
      domains?: Record<string, DomainRaw> | null
    } | null
    if (!data?.domains) return null
    const domains = Object.values(data.domains).map((d) => ({
      bad: d?.bad ?? null,
      ofac: d?.ofac ?? null,
    }))
    return networkSubVerdict(domains)
  })

  const fingerprints = computed(() => {
    // identifiers.apkid.files is an object ({ apkid_version, files, ... }), not the match
    // array itself — the array lives one level deeper at .files.files.
    const data = report.fingerprints.data.value as {
      identifiers?: {
        apkid?: {
          files?: { files?: { matches?: ApkidFileMatches['matches'] }[] | null } | null
        } | null
      } | null
    } | null
    const files = data?.identifiers?.apkid?.files?.files
    if (!files) return null
    return fingerprintsSubVerdict(files.map((f) => ({ matches: f.matches ?? null })))
  })

  return {
    codeAnalysis,
    behaviorAnalysis,
    appInformation,
    threatIntelligence,
    network,
    fingerprints,
  }
}
