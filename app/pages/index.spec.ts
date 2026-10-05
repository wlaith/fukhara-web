import { describe, it, expect, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'

const analyzeApk = vi.fn().mockResolvedValue({ id: 'abc123', status: 'success' })

vi.mock('~/api/reportApi', () => ({
  analyzeApk: (...args: unknown[]) => analyzeApk(...args),
}))

import HomePage from './index.vue'

async function selectFile(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [new File(['x'], 'sample.apk')] })
  await input.trigger('change')
  await flushPromises()
}

describe('home page', () => {
  it('renders the hero heading and file uploader', async () => {
    const wrapper = await mountSuspended(HomePage, { route: '/' })
    expect(wrapper.text()).toContain('Check an app before you trust it.')
  })

  it('navigates to /analyzing/:id after a file is selected', async () => {
    const wrapper = await mountSuspended(HomePage, { route: '/' })
    await selectFile(wrapper)
    await vi.waitFor(() =>
      expect(useRouter().currentRoute.value.fullPath).toBe('/analyzing/abc123'),
    )
  })

  it('renders an error message and does not navigate when analyzeApk rejects', async () => {
    analyzeApk.mockRejectedValueOnce(new Error('Upload failed'))
    const wrapper = await mountSuspended(HomePage, { route: '/' })
    await selectFile(wrapper)
    expect(wrapper.text()).toContain('Upload failed')
    expect(useRouter().currentRoute.value.fullPath).toBe('/')
  })

  it('renders the Arabic hero heading and marketing copy on /ar', async () => {
    const wrapper = await mountSuspended(HomePage, { route: '/ar' })
    expect(wrapper.text()).toContain('تحقق من التطبيق قبل أن تثق به.')
    expect(wrapper.text()).toContain('تقرير قابل للتحميل والمشاركة')
  })
})
