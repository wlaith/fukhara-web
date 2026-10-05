import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AppInformationSection from './AppInformationSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '../../../i18n'

describe('AppInformationSection', () => {
  it('calls load() on mount and renders app details, certificate, components, and manifest findings', () => {
    const load = vi.fn()
    const report = {
      appAnalysis: {
        data: ref({
          apk_details: { package: 'com.example.app', app_name: 'Example', version_name: '1.0.0', sdk: '21 - None' },
          certificate_details: { issuer: 'Example CA', sha256: 'abc123', not_before: '2024-01-01', not_after: '2025-01-01' },
          manifest_analysis: [
            { rule: 'r', title: 'Vulnerable OS version', severity: 'high', description: 'Old Android version', component: [] },
          ],
          activities: { all_activities: ['A', 'B'] },
          receivers: ['R1'],
          services: ['S1'],
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(AppInformationSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('com.example.app')
    expect(wrapper.text()).toContain('Example CA')
    expect(wrapper.text()).toContain('2 Activities · 1 Receivers · 1 Services')
    expect(wrapper.text()).toContain('Vulnerable OS version')
    expect(wrapper.text()).toContain('Old Android version')

    // Certificate row must use the shield icon, not the source (folder) icon used by Components.
    const images = wrapper.findAll('img')
    const certificateImg = images.find((img) => img.attributes('alt') === 'Certificate')
    const componentsImg = images.find((img) => img.attributes('alt') === 'Components')
    expect(certificateImg?.attributes('src')).toContain('shield')
    expect(componentsImg?.attributes('src')).toContain('source')
  })

  it('handles the default mock-mode data shapes: double-nested activities.all_activities and a non-array manifest_analysis', () => {
    const load = vi.fn()
    const report = {
      appAnalysis: {
        data: ref({
          apk_details: { package: 'com.example.app', app_name: 'Example', version_name: '1.0.0', sdk: '21 - None' },
          certificate_details: { issuer: 'Example CA', sha256: 'abc123', not_before: '2024-01-01', not_after: '2025-01-01' },
          manifest_analysis: {} as unknown,
          activities: {
            main_activity: { main_activity: 'com.example.MainActivity' },
            all_activities: { all_activities: ['A', 'B', 'C'] },
          },
          receivers: ['R1'],
          services: ['S1', 'S2'],
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(AppInformationSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('3 Activities · 1 Receivers · 2 Services')
    // Non-array manifest_analysis must not throw and must render zero finding rows.
    expect(wrapper.text()).not.toContain('Manifest Finding')
  })

  it('renders an inline error message when error.value is set', () => {
    const report = {
      appAnalysis: {
        data: ref(null),
        loading: ref(false),
        error: ref('Failed to load app information'),
        load: vi.fn(),
      },
    }
    const wrapper = mount(AppInformationSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.find('.section-error').text()).toBe('Failed to load app information')
  })

  it('shows Arabic titles and the translated components/certificate summaries when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      appAnalysis: {
        data: ref({
          apk_details: { package: 'com.example.app', app_name: 'Example', version_name: '1.0.0', sdk: '21 - None' },
          certificate_details: { issuer: 'Example CA', sha256: 'abc123', not_before: '2024-01-01', not_after: '2025-01-01' },
          manifest_analysis: [],
          activities: { all_activities: ['A', 'B'] },
          receivers: ['R1'],
          services: ['S1'],
        }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
    const wrapper = mount(AppInformationSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('تفاصيل التطبيق')
    expect(wrapper.text()).toContain('الشهادة')
    expect(wrapper.text()).toContain('2 أنشطة · 1 مستقبِلات · 1 خدمات')
    expect(wrapper.text()).toContain('الجهة المُصدرة: Example CA')
    i18n.global.locale.value = 'en'
  })
})
