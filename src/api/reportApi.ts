import { apiGet, apiPostFile } from './client'
import { unwrap, type Envelope } from './envelope'
import { verdictFixture } from './mocks/verdict'
import rawSample from './mocks/fixtures/sample-report-raw.json'
import type { components } from './schema'

// schema.ts marks section fields optional; Envelope<T> requires them. unwrap() is
// runtime-safe for both, so narrow the type here rather than editing either source.
function unwrapSection<T>(
  section: { computed_with?: string[] | null; data?: T | null } | null | undefined,
): T | null {
  return unwrap(section as Envelope<T> | null | undefined)
}

type VerdictResponse = components['schemas']['VerdictResponse']
type FingerprintsResponse = components['schemas']['FingerprintsResponse']
type ThreatIntelligenceResponse = components['schemas']['ThreatIntelligenceResponse']
type AppAnalysisResponse = components['schemas']['AppAnalysisResponse']
type CodeAnalysisResponse = components['schemas']['CodeAnalysisResponse']
type BehaviorAnalysisResponse = components['schemas']['BehaviorAnalysisResponse']
type NetworkAnalysisResponse = components['schemas']['NetworkAnalysisResponse']

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export interface AnalyzeResult {
  id: string
  status: string
}

export async function analyzeApk(file: File): Promise<AnalyzeResult> {
  if (USE_MOCK) {
    return { id: rawSample.fingerprints['checksums[mobsf]'].sha256, status: 'success' }
  }
  return apiPostFile<AnalyzeResult>('/api/analyze/', file)
}

export async function getVerdict(id: string) {
  if (USE_MOCK) return verdictFixture
  const res = await apiGet<components['schemas']['VerdictSectionResponse']>(
    `/api/report/${id}/verdict/`,
  )
  return unwrapSection<VerdictResponse>(res.verdict)
}

export async function getFingerprints(id: string) {
  if (USE_MOCK) {
    return {
      checksums: rawSample.fingerprints['checksums[mobsf]'],
      identifiers: rawSample.fingerprints['identifiers[apkid]'],
      fuzzy_hashes: rawSample.fingerprints["fuzzy_hashes[['ssdeep']]"],
    }
  }
  const res = await apiGet<FingerprintsResponse>(`/api/report/${id}/fingerprints/`)
  return {
    checksums: unwrapSection(res.checksums),
    identifiers: unwrapSection(res.identifiers),
    fuzzy_hashes: unwrapSection(res.fuzzy_hashes),
  }
}

export async function getThreatIntelligence(id: string) {
  if (USE_MOCK) {
    return {
      sample_timeline: rawSample.threat_intelligence["sample_timeline[['fukhara', 'virustotal']]"],
      yara_matches: rawSample.threat_intelligence['yara_matches[yara]'],
      av_detections: rawSample.threat_intelligence['av-detections'],
      third_party_apps: rawSample.threat_intelligence['third-party-apps'],
    }
  }
  const res = await apiGet<ThreatIntelligenceResponse>(`/api/report/${id}/threat-intelligence/`)
  return {
    sample_timeline: unwrapSection(res.sample_timeline),
    yara_matches: unwrapSection(res.yara_matches),
    av_detections: unwrapSection(res['av-detections']),
    third_party_apps: unwrapSection(res['third-party-apps']),
  }
}

export async function getAppAnalysis(id: string) {
  if (USE_MOCK) {
    return {
      apk_details: rawSample.apk_analysis["apk_details[['mobsf', 'apk_info']]"],
      certificate_details: rawSample.apk_analysis['certificate_details[apk_info]'],
      manifest_analysis: rawSample.apk_analysis['manifest_analysis[mobsf]'],
      activities: rawSample.apk_analysis['acitivities[mobsf]'],
      receivers: rawSample.apk_analysis['receivers[mobsf]'],
      services: rawSample.apk_analysis['services[mobsf]'],
    }
  }
  const res = await apiGet<AppAnalysisResponse>(`/api/report/${id}/app/`)
  return {
    apk_details: unwrapSection(res.apk_details),
    certificate_details: unwrapSection(res.certificate_details),
    manifest_analysis: unwrapSection(res.manifest_analysis),
    activities: unwrapSection(res.acitivities),
    receivers: unwrapSection(res.receivers),
    services: unwrapSection(res.services),
  }
}

export async function getCodeAnalysis(id: string) {
  if (USE_MOCK) {
    return {
      niap_analysis: rawSample.code_analysis['niap_analysis[mobsf]'],
      code_vulnerabilities: rawSample.code_analysis['code_vulnerabilties[mobsf]'],
    }
  }
  const res = await apiGet<CodeAnalysisResponse>(`/api/report/${id}/code/`)
  return {
    niap_analysis: unwrapSection(res.niap_analysis),
    code_vulnerabilities: unwrapSection(res.code_vulnerabilties),
  }
}

export async function getBehaviorAnalysis(id: string) {
  if (USE_MOCK) {
    return {
      threats: rawSample.behavior_analysis['threats[quark_engine]'],
      permissions: rawSample.behavior_analysis['permissions[mobsf]'],
      detailed_permissions: rawSample.behavior_analysis['detailed_permissions[mobsf]'],
    }
  }
  const res = await apiGet<BehaviorAnalysisResponse>(`/api/report/${id}/behavior/`)
  return {
    threats: unwrapSection(res.threats),
    permissions: unwrapSection(res.permissions),
    detailed_permissions: unwrapSection(res.detailed_permissions),
  }
}

export async function getNetworkAnalysis(id: string) {
  if (USE_MOCK) {
    return {
      domains: rawSample.network_analysis['domains[mobsf]'],
      urls: rawSample.network_analysis['urls[mobsf]'],
    }
  }
  const res = await apiGet<NetworkAnalysisResponse>(`/api/report/${id}/network/`)
  return {
    domains: unwrapSection(res.domains),
    urls: unwrapSection(res.urls),
  }
}
