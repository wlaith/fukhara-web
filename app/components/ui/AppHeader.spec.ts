import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from './AppHeader.vue'
import i18n from '../../i18n'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/:locale(ar)?',
        component: { template: '<router-view />' },
        children: [
          { path: '', name: 'home', component: { template: '<div>home</div>' } },
          { path: 'report/:id/:section?', name: 'report', component: { template: '<div>report</div>' } },
        ],
      },
    ],
  })
}

async function mountAt(path: string) {
  const router = makeRouter()
  router.push(path)
  await router.isReady()
  return mount(AppHeader, { global: { plugins: [router] } })
}

describe('AppHeader', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('renders the Fukhara logo and nav links', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.find('img[alt="Fukhara"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('About')
    expect(wrapper.text()).toContain('Documentation')
    expect(wrapper.text()).toContain('Analyze')
  })

  it('emits analyze when the Analyze button is clicked', async () => {
    const wrapper = await mountAt('/')
    await wrapper.find('.button--primary').trigger('click')
    expect(wrapper.emitted('analyze')).toHaveLength(1)
  })

  it('shows Arabic nav labels and the English switcher on /ar', async () => {
    i18n.global.locale.value = 'ar'
    const wrapper = await mountAt('/ar')
    expect(wrapper.text()).toContain('حول')
    expect(wrapper.text()).toContain('التوثيق')
    expect(wrapper.text()).toContain('تحليل')
    expect(wrapper.text()).toContain('English')
  })

  it('shows the Arabic switcher label on the unprefixed (English) route', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.text()).toContain('العربية')
  })

  it('clicking the switcher navigates to the /ar prefix of the current route', async () => {
    const router = makeRouter()
    router.push('/')
    await router.isReady()
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    const switcher = wrapper.findAll('button').find((b) => b.text() === 'العربية')
    await switcher?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.params.locale).toBe('ar')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('clicking the switcher on /ar navigates back to the unprefixed English route', async () => {
    const router = makeRouter()
    router.push('/ar')
    await router.isReady()
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    const switcher = wrapper.findAll('button').find((b) => b.text() === 'English')
    await switcher?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(router.currentRoute.value.params.locale).toBeFalsy()
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('preserves the id/section params when switching locale mid-report, in both directions', async () => {
    const router = makeRouter()
    router.push('/ar/report/abc123/network')
    await router.isReady()
    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    const toEnglish = wrapper.findAll('button').find((b) => b.text() === 'English')
    await toEnglish?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/report/abc123/network')
    expect(router.currentRoute.value.params.locale).toBeFalsy()

    const wrapper2 = mount(AppHeader, { global: { plugins: [router] } })
    const toArabic = wrapper2.findAll('button').find((b) => b.text() === 'العربية')
    await toArabic?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/ar/report/abc123/network')
    expect(router.currentRoute.value.params.locale).toBe('ar')
  })
})
