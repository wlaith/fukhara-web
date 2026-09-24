import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/reportApi', () => ({
  getVerdict: vi.fn().mockResolvedValue({ verdict: 'Malicious' }),
  getFingerprints: vi
    .fn()
    .mockResolvedValue({ checksums: null, identifiers: null, fuzzy_hashes: null }),
  getThreatIntelligence: vi.fn().mockResolvedValue({}),
  getAppAnalysis: vi.fn().mockResolvedValue({}),
  getCodeAnalysis: vi.fn().mockResolvedValue({}),
  getBehaviorAnalysis: vi.fn().mockResolvedValue({}),
  getNetworkAnalysis: vi.fn().mockResolvedValue({}),
}))

import { getVerdict } from '../api/reportApi'
import { useReport } from './useReport'

describe('useReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts each section with no data and not loading', () => {
    const report = useReport('sample-id')
    expect(report.verdict.data.value).toBeNull()
    expect(report.verdict.loading.value).toBe(false)
    expect(report.verdict.error.value).toBeNull()
  })

  it('load() fetches and populates data, then sets loading back to false', async () => {
    const report = useReport('sample-id')
    const promise = report.verdict.load()
    expect(report.verdict.loading.value).toBe(true)
    await promise
    expect(report.verdict.loading.value).toBe(false)
    expect(report.verdict.data.value).toEqual({ verdict: 'Malicious' })
  })

  it('load() only calls the API once across repeated calls (caches)', async () => {
    const report = useReport('sample-id')
    await report.verdict.load()
    await report.verdict.load()
    expect(getVerdict).toHaveBeenCalledTimes(1)
  })

  it('sets error and clears loading when the fetch rejects', async () => {
    vi.mocked(getVerdict).mockRejectedValueOnce(new Error('network down'))
    const report = useReport('sample-id')
    await report.verdict.load()
    expect(report.verdict.loading.value).toBe(false)
    expect(report.verdict.error.value).toBe('network down')
  })
})
