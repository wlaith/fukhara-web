import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

export function useLocalizedNavigation() {
  const route = useRoute()
  const router = useRouter()

  function withCurrentLocale(to: RouteLocationRaw): RouteLocationRaw {
    if (typeof to === 'string' || 'path' in to) return to
    return { ...to, params: { locale: route.params.locale, ...to.params } }
  }

  return {
    push: (to: RouteLocationRaw) => router.push(withCurrentLocale(to)),
    replace: (to: RouteLocationRaw) => router.replace(withCurrentLocale(to)),
  }
}
