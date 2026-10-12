import { describe, it, expect, vi, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const config = vi.hoisted(() => ({
  app: { baseURL: '/', buildAssetsDir: '/_nuxt/', cdnURL: '' },
  public: { useMock: false },
}))
mockNuxtImport('useRuntimeConfig', () => () => config)

const { fukharaMock } = vi.hoisted(() => ({ fukharaMock: vi.fn() }))
mockNuxtImport('$fukhara', () => fukharaMock)

import { getVerdict, analyzeApk } from './reportApi'

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

  it('POSTs the file as multipart form data', async () => {
    fukharaMock.mockResolvedValue({ id: 'abc123', status: 'success' })
    const result = await analyzeApk(new File(['x'], 'sample.apk'))
    const [path, options] = fukharaMock.mock.calls[0]!
    expect(path).toBe('/api/analyze/')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('file')).toBeInstanceOf(File)
    expect(result).toEqual({ id: 'abc123', status: 'success' })
  })
})
