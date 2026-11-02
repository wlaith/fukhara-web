import { computed, ref, shallowRef } from 'vue'
import { ApiError } from '~/api/client'
import type { AnalysisStatus } from '~/api/reportApi'
import type { Translate } from '~/domain/translate'

const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 15 * 60 * 1000
const MAX_CONSECUTIVE_ERRORS = 5

export function useAnalysisProgress(
  onComplete: () => void,
  t: Translate,
  fetchStatus: () => Promise<AnalysisStatus>,
) {
  const toolsDone = ref<string[]>([])
  const toolsTotal = shallowRef(0)
  const elapsedSeconds = shallowRef(0)
  const error = shallowRef<string | null>(null)
  const percent = computed(() =>
    toolsTotal.value > 0 ? Math.round((toolsDone.value.length / toolsTotal.value) * 100) : 0,
  )

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let clockTimer: ReturnType<typeof setInterval> | null = null
  let polling = false

  function start() {
    if (polling) return
    polling = true
    error.value = null
    const startedAt = Date.now()
    let consecutiveErrors = 0
    elapsedSeconds.value = 0
    clockTimer = setInterval(() => {
      elapsedSeconds.value = Math.floor((Date.now() - startedAt) / 1000)
    }, 1000)

    function fail(message: string) {
      error.value = message
      stop()
    }

    async function poll() {
      pollTimer = null
      try {
        const status = await fetchStatus()
        if (!polling) return
        consecutiveErrors = 0
        toolsDone.value = status.toolsDone
        toolsTotal.value = status.toolsTotal

        if (status.status === 'completed') {
          stop()
          onComplete()
          return
        }
        if (status.status === 'failed') return fail(t('analyzingView.errors.failed'))
      } catch (err) {
        if (!polling) return
        if (err instanceof ApiError && err.status === 404) {
          return fail(t('analyzingView.errors.notFound'))
        }
        consecutiveErrors += 1
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          return fail(t('analyzingView.errors.unreachable'))
        }
      }

      if (Date.now() - startedAt >= MAX_WAIT_MS) return fail(t('analyzingView.errors.timeout'))
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    void poll()
  }

  function stop() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    if (clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
    polling = false
  }

  return { toolsDone, toolsTotal, percent, elapsedSeconds, error, start, stop }
}
