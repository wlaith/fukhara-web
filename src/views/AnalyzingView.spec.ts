import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AnalyzingView from './AnalyzingView.vue'
import i18n from '../i18n'

describe('AnalyzingView', () => {
  it('renders the progress heading', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/analyzing/:id', component: AnalyzingView },
        { path: '/report/:id', name: 'report', component: { template: '<div>report</div>' } },
      ],
    })
    router.push('/analyzing/abc123')
    await router.isReady()
    const wrapper = mount(AnalyzingView, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('We are analyzing your file')
  })

  it('renders the Arabic progress heading when the locale is ar', async () => {
    i18n.global.locale.value = 'ar'
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/analyzing/:id', component: AnalyzingView },
        { path: '/report/:id', name: 'report', component: { template: '<div>report</div>' } },
      ],
    })
    router.push('/analyzing/abc123')
    await router.isReady()
    const wrapper = mount(AnalyzingView, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('نقوم بتحليل ملفك')
    i18n.global.locale.value = 'en'
  })
})
