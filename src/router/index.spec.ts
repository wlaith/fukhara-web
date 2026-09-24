import { describe, it, expect, beforeEach } from 'vitest'
import router from './index'
import i18n from '../i18n'

describe('router locale handling', () => {
  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  it('defaults unprefixed routes to English (ltr)', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
    expect(i18n.global.locale.value).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('resolves the /ar prefix to Arabic (rtl) without changing the route name', async () => {
    await router.push('/ar')
    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.params.locale).toBe('ar')
    expect(i18n.global.locale.value).toBe('ar')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('carries the locale prefix through nested params on /ar/report/:id/:section', async () => {
    await router.push('/ar/report/abc123/network')
    expect(router.currentRoute.value.name).toBe('report')
    expect(router.currentRoute.value.params.id).toBe('abc123')
    expect(router.currentRoute.value.params.section).toBe('network')
    expect(router.currentRoute.value.params.locale).toBe('ar')
  })

  it('resolves the unprefixed equivalent to the same route with no locale param', async () => {
    await router.push('/report/abc123/network')
    expect(router.currentRoute.value.name).toBe('report')
    expect(router.currentRoute.value.params.id).toBe('abc123')
    expect(router.currentRoute.value.params.section).toBe('network')
    expect(router.currentRoute.value.params.locale).toBeFalsy()
  })
})
