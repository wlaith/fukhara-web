import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

const analyzeApk = vi.fn().mockResolvedValue({ id: 'abc123', status: 'success' })

vi.mock('../api/reportApi', () => ({
  analyzeApk: (...args: unknown[]) => analyzeApk(...args),
}))

import HomeView from './HomeView.vue'
import i18n from '../i18n'

async function mountWithRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/analyzing/:id', name: 'analyzing', component: { template: '<div>analyzing</div>' } },
    ],
  })
  router.push('/')
  await router.isReady()
  return { wrapper: mount(HomeView, { global: { plugins: [router] } }), router }
}

describe('HomeView', () => {
  it('renders the hero heading and file uploader', async () => {
    const { wrapper } = await mountWithRouter()
    expect(wrapper.text()).toContain('Check an app before you trust it.')
  })

  it('navigates to /analyzing/:id after a file is selected', async () => {
    const { wrapper, router } = await mountWithRouter()
    const input = wrapper.get('input[type="file"]')
    const file = new File(['x'], 'sample.apk')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(router.currentRoute.value.name).toBe('analyzing')
    expect(router.currentRoute.value.params.id).toBe('abc123')
  })

  it('renders an error message and does not navigate when analyzeApk rejects', async () => {
    analyzeApk.mockRejectedValueOnce(new Error('Upload failed'))
    const { wrapper, router } = await mountWithRouter()
    const input = wrapper.get('input[type="file"]')
    const file = new File(['x'], 'sample.apk')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Upload failed')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('renders the Arabic hero heading and marketing copy when the locale is ar', async () => {
    i18n.global.locale.value = 'ar'
    const { wrapper } = await mountWithRouter()
    expect(wrapper.text()).toContain('تحقق من التطبيق قبل أن تثق به.')
    expect(wrapper.text()).toContain('تقرير قابل للتحميل والمشاركة')
    i18n.global.locale.value = 'en'
  })
})
