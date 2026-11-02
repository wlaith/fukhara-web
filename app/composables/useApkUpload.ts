import { computed, shallowRef } from 'vue'
import { analyzeApk, type AnalyzeResult } from '~/api/reportApi'

export function useApkUpload() {
  const isUploading = shallowRef(false)
  const loaded = shallowRef(0)
  const total = shallowRef(0)
  let controller: AbortController | null = null

  const percent = computed(() => (total.value > 0 ? Math.round((loaded.value / total.value) * 100) : 0))

  async function upload(file: File): Promise<AnalyzeResult | null> {
    controller = new AbortController()
    isUploading.value = true
    loaded.value = 0
    total.value = file.size
    try {
      return await analyzeApk(file, {
        signal: controller.signal,
        onProgress: (done, size) => {
          loaded.value = done
          total.value = size
        },
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null
      throw err
    } finally {
      isUploading.value = false
      controller = null
    }
  }

  function cancel() {
    controller?.abort()
  }

  return { isUploading, loaded, total, percent, upload, cancel }
}
