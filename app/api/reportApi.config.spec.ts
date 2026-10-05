import { describe, it, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const config = vi.hoisted(() => ({
  app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' },
  public: { apiBaseUrl: 'https://api.example.test', useMock: false },
}))
mockNuxtImport('useRuntimeConfig', () => () => config)

import { getVerdict, analyzeApk } from './reportApi'

describe('reportApi with useMock=false', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GETs the verdict from the configured base URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ verdict: null }) })
    vi.stubGlobal('fetch', fetchMock)
    const result = await getVerdict('abc123')
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/report/abc123/verdict/')
    expect(result).toBeNull()
  })

  it('POSTs the file to the configured base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'abc123', status: 'success' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const result = await analyzeApk(new File(['x'], 'sample.apk'))
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/analyze/',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result).toEqual({ id: 'abc123', status: 'success' })
  })
})
