import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiGet, apiPostFile, ApiError } from './client'

describe('apiGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ hello: 'world' }) }),
    )
    const result = await apiGet<{ hello: string }>('/api/reports/')
    expect(result).toEqual({ hello: 'world' })
  })

  it('throws ApiError on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }),
    )
    await expect(apiGet('/api/report/missing/')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('apiPostFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts a FormData body and returns parsed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'abc123', status: 'success' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['content'], 'sample.apk')
    const result = await apiPostFile<{ id: string; status: string }>('/api/analyze/', file)
    expect(result).toEqual({ id: 'abc123', status: 'success' })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/analyze/'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
