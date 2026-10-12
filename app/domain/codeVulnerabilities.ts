import type { components } from '../api/schema'
import { severityRank, type Severity } from './severity'

type RawFinding = components['schemas']['CodeVulnerabilityFinding']

export interface AffectedFile {
  path: string
  lines: string[]
}

export interface CodeVulnerability {
  id: string
  title: string
  severity: Severity | null
  cweId: string | null
  cvss: number | null
  masvs: string | null
  owaspMobile: string | null
  description: string | null
  referenceUrl: string | null
  files: AffectedFile[]
}

const SEVERITIES: readonly string[] = ['high', 'warning', 'info', 'good']
const CWE_PATTERN = /^\s*(CWE-\d+)\s*[:\-–·]?\s*(.*)$/i

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toSeverity(value: string | null | undefined): Severity | null {
  const key = value?.trim().toLowerCase()
  return key && SEVERITIES.includes(key) ? (key as Severity) : null
}

// "android_logging" -> "Android logging"
function humanizeKey(key: string): string {
  const words = key.replace(/[_-]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function parseCwe(cwe: string | null | undefined): { id: string | null; name: string | null } {
  const value = nonEmpty(cwe)
  if (!value) return { id: null, name: null }
  const match = CWE_PATTERN.exec(value)
  if (!match) return { id: null, name: value }
  return { id: match[1]!.toUpperCase(), name: nonEmpty(match[2]) }
}

// Reference URLs come from scanner output, so only http(s) links are rendered.
export function safeHttpUrl(value: string | null | undefined): string | null {
  const candidate = nonEmpty(value)
  if (!candidate) return null
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function parseFiles(files: Record<string, string> | null | undefined): AffectedFile[] {
  return Object.entries(files ?? {}).map(([path, lines]) => ({
    path,
    lines: (lines ?? '')
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean),
  }))
}

export function toCodeVulnerability(id: string, finding: RawFinding | null | undefined): CodeVulnerability {
  const metadata = finding?.metadata
  const cwe = parseCwe(metadata?.cwe)
  const cvss = metadata?.cvss
  return {
    id,
    title: cwe.name ?? humanizeKey(id),
    severity: toSeverity(metadata?.severity),
    cweId: cwe.id,
    cvss: typeof cvss === 'number' && cvss > 0 ? cvss : null,
    masvs: nonEmpty(metadata?.masvs),
    owaspMobile: nonEmpty(metadata?.['owasp-mobile']),
    description: nonEmpty(metadata?.description),
    referenceUrl: safeHttpUrl(metadata?.ref),
    files: parseFiles(finding?.files),
  }
}

export function toCodeVulnerabilities(
  raw: Record<string, RawFinding | null | undefined> | null | undefined,
): CodeVulnerability[] {
  return Object.entries(raw ?? {})
    .map(([id, finding]) => toCodeVulnerability(id, finding))
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) || (b.cvss ?? 0) - (a.cvss ?? 0),
    )
}
