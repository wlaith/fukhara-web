import i18n from '../i18n'

export type Severity = 'high' | 'warning' | 'info' | 'good'
export type PermissionStatus = 'dangerous' | 'normal' | 'unknown'
export type TagKind = 'red' | 'gold' | 'green' | 'gray'

const SEVERITY_KIND: Record<Severity, TagKind> = {
  high: 'red',
  warning: 'gold',
  info: 'gray',
  good: 'green',
}

const SEVERITY_RANK: Record<Severity, number> = {
  high: 3,
  warning: 2,
  info: 1,
  good: 0,
}

const PERMISSION_STATUS_KIND: Record<PermissionStatus, TagKind> = {
  dangerous: 'red',
  normal: 'gold',
  unknown: 'gray',
}

export function severityKind(severity: Severity | null | undefined): TagKind {
  if (!severity) return 'gray'
  return SEVERITY_KIND[severity] ?? 'gray'
}

export function severityRank(severity: Severity | null | undefined): number {
  if (!severity) return -1
  return SEVERITY_RANK[severity] ?? -1
}

export function permissionStatusKind(status: PermissionStatus | null | undefined): TagKind {
  if (!status) return 'gray'
  return PERMISSION_STATUS_KIND[status] ?? 'gray'
}

// Falls back to the raw value verbatim for anything unrecognized.
export function severityLabel(severity: Severity | string | null | undefined): string {
  const key = (severity ?? '').toString().toLowerCase()
  const map: Record<string, string> = {
    high: i18n.global.t('severity.high'),
    warning: i18n.global.t('severity.warning'),
    info: i18n.global.t('severity.info'),
    good: i18n.global.t('severity.good'),
  }
  return map[key] ?? (severity ?? '').toString()
}

export function permissionStatusLabel(status: PermissionStatus | string | null | undefined): string {
  const key = (status ?? '').toString().toLowerCase()
  const map: Record<string, string> = {
    dangerous: i18n.global.t('severity.dangerous'),
    normal: i18n.global.t('severity.normal'),
    unknown: i18n.global.t('severity.unknown'),
  }
  return map[key] ?? (status ?? '').toString()
}

const VERDICT_SEVERITY_KIND: Record<string, TagKind> = {
  high: 'red',
  medium: 'gold',
  low: 'green',
}

/**
 * Maps the VerdictResponse API's `severity` vocabulary ("High" | "Medium" | "Low",
 * case-insensitive) to a tag color. This is a distinct vocabulary from `Severity`
 * above, which is used for code/manifest findings.
 */
export function verdictSeverityKind(severity: string | null | undefined): TagKind {
  if (!severity) return 'gray'
  return VERDICT_SEVERITY_KIND[severity.toLowerCase()] ?? 'gray'
}
