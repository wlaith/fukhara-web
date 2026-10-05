import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAnalysisProgress } from './useAnalysisProgress'
import i18n from '~/test-utils/i18n'

describe('useAnalysisProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at the first step label and 0%', () => {
    const { stepLabel, percent } = useAnalysisProgress(() => {}, i18n.global.t)
    expect(stepLabel.value).toBe('Uploading file')
    expect(percent.value).toBe(0)
  })

  it('advances through steps and increases percent as time passes', () => {
    const { stepLabel, percent, start } = useAnalysisProgress(() => {}, i18n.global.t)
    start()
    vi.advanceTimersByTime(2000)
    expect(stepLabel.value).toBe('Running static analysis')
    expect(percent.value).toBeGreaterThan(0)
  })

  it('calls onComplete once all steps finish', () => {
    const onComplete = vi.fn()
    const { start } = useAnalysisProgress(onComplete, i18n.global.t)
    start()
    vi.advanceTimersByTime(10000)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('stop() prevents further step advancement', () => {
    const { stepLabel, start, stop } = useAnalysisProgress(() => {}, i18n.global.t)
    start()
    vi.advanceTimersByTime(2000)
    stop()
    const labelAfterStop = stepLabel.value
    vi.advanceTimersByTime(8000)
    expect(stepLabel.value).toBe(labelAfterStop)
  })

  it('uses Arabic step labels when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const { stepLabel } = useAnalysisProgress(() => {}, i18n.global.t)
    expect(stepLabel.value).toBe('جارٍ رفع الملف')
    i18n.global.locale.value = 'en'
  })
})

describe('useAnalysisProgress translator argument', () => {
  it('builds step labels with the supplied t, not shared locale state', () => {
    i18n.global.locale.value = 'ar'
    const { stepLabel } = useAnalysisProgress(() => {}, ((key: string) => `fake:${key}`) as never)
    expect(stepLabel.value).toBe('fake:analyzingView.steps.uploading')
    i18n.global.locale.value = 'en'
  })
})
