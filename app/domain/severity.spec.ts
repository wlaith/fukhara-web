import { describe, it, expect } from 'vitest'
import {
  severityKind,
  severityRank,
  permissionStatusKind,
  verdictSeverityKind,
  severityLabel as severityLabelWithT,
  permissionStatusLabel as permissionStatusLabelWithT,
} from './severity'
import i18n from '~/test-utils/i18n'
import { withTestT } from '~/test-utils/translate'
import type { Translate } from '~/domain/translate'

const severityLabel = withTestT(severityLabelWithT)
const permissionStatusLabel = withTestT(permissionStatusLabelWithT)

describe('severityKind', () => {
  it('maps each known severity to its tag color', () => {
    expect(severityKind('high')).toBe('red')
    expect(severityKind('warning')).toBe('gold')
    expect(severityKind('info')).toBe('gray')
    expect(severityKind('good')).toBe('green')
  })

  it('falls back to gray for null/undefined', () => {
    expect(severityKind(null)).toBe('gray')
    expect(severityKind(undefined)).toBe('gray')
  })
})

describe('severityRank', () => {
  it('orders high above warning above info above good', () => {
    expect(severityRank('high')).toBeGreaterThan(severityRank('warning'))
    expect(severityRank('warning')).toBeGreaterThan(severityRank('info'))
    expect(severityRank('info')).toBeGreaterThan(severityRank('good'))
  })

  it('returns -1 for null/undefined', () => {
    expect(severityRank(null)).toBe(-1)
    expect(severityRank(undefined)).toBe(-1)
  })
})

describe('permissionStatusKind', () => {
  it('maps dangerous to red, normal to gray, unknown to gray', () => {
    expect(permissionStatusKind('dangerous')).toBe('red')
    expect(permissionStatusKind('normal')).toBe('gray')
    expect(permissionStatusKind('unknown')).toBe('gray')
  })

  it('falls back to gray for null/undefined', () => {
    expect(permissionStatusKind(null)).toBe('gray')
    expect(permissionStatusKind(undefined)).toBe('gray')
  })
})

describe('verdictSeverityKind', () => {
  it('maps each known severity to its tag color case-insensitively', () => {
    expect(verdictSeverityKind('High')).toBe('red')
    expect(verdictSeverityKind('MEDIUM')).toBe('gold')
    expect(verdictSeverityKind('low')).toBe('green')
  })

  it('falls back to gray for an unrecognized value', () => {
    expect(verdictSeverityKind('Critical')).toBe('gray')
  })

  it('falls back to gray for null/undefined', () => {
    expect(verdictSeverityKind(null)).toBe('gray')
    expect(verdictSeverityKind(undefined)).toBe('gray')
  })
})

describe('severityLabel', () => {
  it('labels each known severity in English', () => {
    expect(severityLabel('high')).toBe('High')
    expect(severityLabel('warning')).toBe('Medium')
    expect(severityLabel('info')).toBe('Info')
    expect(severityLabel('good')).toBe('Secure')
  })

  it('translates to Arabic when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    expect(severityLabel('high')).toBe('عالية')
    expect(severityLabel('warning')).toBe('متوسطة')
    expect(severityLabel('info')).toBe('معلومة')
    expect(severityLabel('good')).toBe('آمن')
    i18n.global.locale.value = 'en'
  })

  it('falls back to the raw value for an unrecognized severity', () => {
    expect(severityLabel('critical')).toBe('critical')
  })
})

describe('permissionStatusLabel', () => {
  it('labels each known status in English', () => {
    expect(permissionStatusLabel('dangerous')).toBe('High')
    expect(permissionStatusLabel('normal')).toBe('Low')
    expect(permissionStatusLabel('unknown')).toBe('Unknown')
  })

  it('translates to Arabic when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    expect(permissionStatusLabel('dangerous')).toBe('عالية')
    expect(permissionStatusLabel('normal')).toBe('منخفضة')
    expect(permissionStatusLabel('unknown')).toBe('غير معروف')
    i18n.global.locale.value = 'en'
  })
})

describe('label helpers translate through the t argument', () => {
  const fakeT = ((key: string) => `fake:${key}`) as unknown as Translate

  it('severityLabel ignores shared locale state', () => {
    i18n.global.locale.value = 'ar'
    expect(severityLabelWithT('high', fakeT)).toBe('fake:severity.high')
    i18n.global.locale.value = 'en'
  })

  it('permissionStatusLabel ignores shared locale state', () => {
    i18n.global.locale.value = 'ar'
    expect(permissionStatusLabelWithT('dangerous', fakeT)).toBe('fake:severity.high')
    i18n.global.locale.value = 'en'
  })

  it('still falls back to the raw value for an unrecognized severity', () => {
    expect(severityLabelWithT('critical', fakeT)).toBe('critical')
  })
})
