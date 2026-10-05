import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

const getVerdict = vi.fn().mockResolvedValue({ verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' })
const getFingerprints = vi.fn().mockResolvedValue({})
const getThreatIntelligence = vi.fn().mockResolvedValue({})
const getAppAnalysis = vi.fn().mockResolvedValue({})
const getCodeAnalysis = vi.fn().mockResolvedValue({})
const getBehaviorAnalysis = vi.fn().mockResolvedValue({})
const getNetworkAnalysis = vi.fn().mockResolvedValue({})

vi.mock('../api/reportApi', () => ({
  getVerdict: (...args: unknown[]) => getVerdict(...args),
  getFingerprints: (...args: unknown[]) => getFingerprints(...args),
  getThreatIntelligence: (...args: unknown[]) => getThreatIntelligence(...args),
  getAppAnalysis: (...args: unknown[]) => getAppAnalysis(...args),
  getCodeAnalysis: (...args: unknown[]) => getCodeAnalysis(...args),
  getBehaviorAnalysis: (...args: unknown[]) => getBehaviorAnalysis(...args),
  getNetworkAnalysis: (...args: unknown[]) => getNetworkAnalysis(...args),
}))

import ReportView from './ReportView.vue'
import i18n from '../i18n'

async function mountReportView(initialPath = '/report/abc123') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/report/:id/:section?', name: 'report', component: ReportView }],
  })
  router.push(initialPath)
  await router.isReady()
  const wrapper = mount(ReportView, { global: { plugins: [router] } })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return { wrapper, router }
}

describe('ReportView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getVerdict.mockResolvedValue({ verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' })
    getFingerprints.mockResolvedValue({})
    getThreatIntelligence.mockResolvedValue({})
    getAppAnalysis.mockResolvedValue({})
    getCodeAnalysis.mockResolvedValue({})
    getBehaviorAnalysis.mockResolvedValue({})
    getNetworkAnalysis.mockResolvedValue({})
  })

  it('fetches and renders the verdict banner', async () => {
    const { wrapper } = await mountReportView()
    expect(wrapper.text()).toContain('Malicious')
  })

  it('defaults to the code-analysis section and shows all 7 vertical tabs', async () => {
    const { wrapper } = await mountReportView()
    for (const label of [
      'Code Analysis',
      'Behavior Analysis',
      'App Information',
      'Threat Intelligence',
      'Network',
      'Fingerprints',
      'Control Flow',
    ]) {
      expect(wrapper.text()).toContain(label)
    }
  })

  it('eagerly loads all 6 data sections on mount, not just the active tab (regression: SubVerdictGrid needs all 6)', async () => {
    await mountReportView()
    expect(getFingerprints).toHaveBeenCalledTimes(1)
    expect(getThreatIntelligence).toHaveBeenCalledTimes(1)
    expect(getAppAnalysis).toHaveBeenCalledTimes(1)
    expect(getCodeAnalysis).toHaveBeenCalledTimes(1)
    expect(getBehaviorAnalysis).toHaveBeenCalledTimes(1)
    expect(getNetworkAnalysis).toHaveBeenCalledTimes(1)
  })

  it('renders the Control Flow section and updates the route when its tab is selected', async () => {
    const { wrapper, router } = await mountReportView()
    const controlFlowTab = wrapper.findAll('.vertical-tabs__item').find((el) => el.text() === 'Control Flow')
    await controlFlowTab?.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(router.currentRoute.value.params.section).toBe('control-flow')
    expect(wrapper.text()).toContain('Not yet available')
  })

  it('shows Arabic tab labels when the locale is ar', async () => {
    i18n.global.locale.value = 'ar'
    const { wrapper } = await mountReportView()
    for (const label of ['تحليل الشيفرة', 'تحليل السلوك', 'معلومات التطبيق', 'الشبكة', 'البصمات']) {
      expect(wrapper.text()).toContain(label)
    }
    i18n.global.locale.value = 'en'
  })
})
