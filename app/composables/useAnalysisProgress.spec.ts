import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAnalysisProgress } from './useAnalysisProgress'
import i18n from '~/test-utils/i18n'
import en from '../../i18n/locales/en.json'
import { ApiError } from '~/api/client'

describe('useAnalysisProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const pending = (toolsDone: string[]) => ({
    status: 'pending' as const,
    toolsDone,
    toolsTotal: 8,
  })

  const eight = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  it('follows the reported tool progress', async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(pending(['apkid', 'yara']))
      .mockResolvedValueOnce(
        pending(['apkid', 'yara', 'mobsf', 'virustotal', 'exodus', 'trufflehog']),
      )
    const { toolsDone, percent, start, stop } = useAnalysisProgress(
      () => {},
      i18n.global.t,
      fetchStatus,
    )
    start()
    await vi.advanceTimersByTimeAsync(0)
    expect(toolsDone.value).toEqual(['apkid', 'yara'])
    expect(percent.value).toBe(25)
    await vi.advanceTimersByTimeAsync(3000)
    expect(toolsDone.value).toHaveLength(6)
    expect(percent.value).toBe(75)
    stop()
  })

  it('calls onComplete once the analysis completes', async () => {
    const onComplete = vi.fn()
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(pending(['apkid', 'yara', 'mobsf', 'exodus']))
      .mockResolvedValueOnce({ status: 'completed', toolsDone: eight, toolsTotal: 8 })
    const { percent, start } = useAnalysisProgress(onComplete, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(3000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(percent.value).toBe(100)
    await vi.advanceTimersByTimeAsync(30000)
    expect(fetchStatus).toHaveBeenCalledTimes(2)
  })

  it('reports a failed analysis and stops polling', async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValue({ status: 'failed', toolsDone: eight, toolsTotal: 8 })
    const onComplete = vi.fn()
    const fakeT = ((key: string) => `fake:${key}`) as never
    const { error, start } = useAnalysisProgress(onComplete, fakeT, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(30000)
    expect(error.value).toBe('fake:analyzingView.errors.failed')
    expect(fetchStatus).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('reports an unknown analysis on a 404', async () => {
    const fetchStatus = vi.fn().mockRejectedValue(new ApiError(404, 'not found'))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(0)
    expect(error.value).toBe(en.analyzingView.errors.notFound)
  })

  it('retries transient errors before giving up', async () => {
    const fetchStatus = vi.fn().mockRejectedValue(new ApiError(502, 'bad gateway'))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(3000 * 3)
    expect(error.value).toBeNull()
    await vi.advanceTimersByTimeAsync(3000)
    expect(error.value).toBe(en.analyzingView.errors.unreachable)
    expect(fetchStatus).toHaveBeenCalledTimes(5)
  })

  it('gives up after the maximum wait', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(pending(['apkid']))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(error.value).toBe(en.analyzingView.errors.timeout)
  })

  it('stop() prevents further polling', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(pending(['apkid']))
    const { start, stop } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(0)
    stop()
    await vi.advanceTimersByTimeAsync(30000)
    expect(fetchStatus).toHaveBeenCalledTimes(1)
  })

  it('counts elapsed seconds until stop()', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(pending(['apkid']))
    const { elapsedSeconds, start, stop } = useAnalysisProgress(
      () => {},
      i18n.global.t,
      fetchStatus,
    )
    start()
    await vi.advanceTimersByTimeAsync(5000)
    expect(elapsedSeconds.value).toBe(5)
    stop()
    await vi.advanceTimersByTimeAsync(5000)
    expect(elapsedSeconds.value).toBe(5)
  })
})
