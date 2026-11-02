import { describe, it, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const config = vi.hoisted(() => ({
  app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' },
  public: { useMock: false },
}))
mockNuxtImport('useRuntimeConfig', () => () => config)

const { fukharaMock } = vi.hoisted(() => ({ fukharaMock: vi.fn() }))
mockNuxtImport('$fukhara', () => fukharaMock)

import { getVerdict, analyzeApk, getAnalysisStatus } from './reportApi'
import { ApiError } from './client'

describe('reportApi with useMock=false', () => {
  afterEach(() => {
    fukharaMock.mockReset()
  })

  it('GETs the verdict through the API client', async () => {
    fukharaMock.mockResolvedValue({ verdict: null })
    const result = await getVerdict('abc123')
    expect(fukharaMock).toHaveBeenCalledWith('/api/report/{id}/verdict/', {
      path: { id: 'abc123' },
    })
    expect(result).toBeNull()
  })

  it('POSTs the file as multipart form data and reports upload progress', async () => {
    const sent: { method?: string; url?: string; body?: FormData } = {}
    class FakeXhr {
      upload: { onprogress?: (event: { loaded: number; total: number }) => void } = {}
      status = 200
      response = { id: 'abc123', status: 'success' }
      responseType = ''
      onload?: () => void
      open(method: string, url: string) {
        sent.method = method
        sent.url = url
      }
      send(body: FormData) {
        sent.body = body
        this.upload.onprogress?.({ loaded: 1, total: 2 })
        this.onload?.()
      }
    }
    vi.stubGlobal('XMLHttpRequest', FakeXhr)
    const onProgress = vi.fn()
    const result = await analyzeApk(new File(['x'], 'sample.apk'), { onProgress })
    vi.unstubAllGlobals()
    expect(sent.method).toBe('POST')
    expect(sent.url).toBe('/api/__api_party/fukhara/proxy/api/analyze/')
    expect(sent.body?.get('file')).toBeInstanceOf(File)
    expect(onProgress).toHaveBeenCalledWith(1, 2)
    expect(result).toEqual({ id: 'abc123', status: 'success' })
  })

  it('maps the analysis status', async () => {
    fukharaMock.mockResolvedValue({
      id: 'abc123',
      status: 'pending',
      uploaded_at: null,
      tools_done: ['mobsf', 'apkid'],
      tools_total: 9,
    })
    const result = await getAnalysisStatus('abc123')
    expect(fukharaMock).toHaveBeenCalledWith('/api/report/{id}/status/', {
      path: { id: 'abc123' },
    })
    expect(result).toEqual({ status: 'pending', toolsDone: 2, toolsTotal: 9 })
  })

  it('raises an ApiError when the API responds with an error', async () => {
    fukharaMock.mockRejectedValue(Object.assign(new Error('Not Found'), { statusCode: 404 }))
    await expect(getAnalysisStatus('missing')).rejects.toBeInstanceOf(ApiError)
  })
})
