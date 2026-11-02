import { onMounted, ref } from 'vue'

export interface RecentReport {
  id: string
  appName: string
  verdict: string | null
  severity: string | null
  viewedAt: number
}

const STORAGE_KEY = 'fukhara:recent-reports'
const MAX_REPORTS = 5

function read(): RecentReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(reports: RecentReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    return
  }
}

export function useRecentReports() {
  const reports = ref<RecentReport[]>([])

  onMounted(() => {
    reports.value = read()
  })

  function remember(report: Omit<RecentReport, 'viewedAt'>) {
    const next = [{ ...report, viewedAt: Date.now() }, ...read().filter((r) => r.id !== report.id)].slice(0, MAX_REPORTS)
    write(next)
    reports.value = next
  }

  function clear() {
    write([])
    reports.value = []
  }

  function restore(previous: RecentReport[]) {
    write(previous)
    reports.value = previous
  }

  return { reports, remember, clear, restore }
}
