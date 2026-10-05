import { ref } from 'vue'
import i18n from '../i18n'

function steps(): string[] {
  return [
    i18n.global.t('analyzingView.steps.uploading'),
    i18n.global.t('analyzingView.steps.staticAnalysis'),
    i18n.global.t('analyzingView.steps.threatIntelligence'),
    i18n.global.t('analyzingView.steps.generatingReport'),
  ]
}

const STEP_DURATION_MS = 2000

export function useAnalysisProgress(onComplete: () => void) {
  const stepIndex = ref(0)
  const stepLabel = ref(steps()[0])
  const percent = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timer) return
    const currentSteps = steps()
    timer = setInterval(() => {
      stepIndex.value += 1
      if (stepIndex.value >= currentSteps.length) {
        percent.value = 100
        stop()
        onComplete()
        return
      }
      stepLabel.value = currentSteps[stepIndex.value]
      percent.value = Math.round((stepIndex.value / currentSteps.length) * 100)
    }, STEP_DURATION_MS)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return { stepLabel, percent, start, stop }
}
