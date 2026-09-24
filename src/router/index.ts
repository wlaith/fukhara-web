import { createRouter, createWebHistory, RouterView } from 'vue-router'
import i18n, { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '../i18n'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
       path: '/:locale(ar)?',
      component: RouterView,
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
        { path: 'analyzing/:id', name: 'analyzing', component: () => import('../views/AnalyzingView.vue') },
        { path: 'report/:id/:section?', name: 'report', component: () => import('../views/ReportView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const locale: Locale = isSupportedLocale(to.params.locale) ? to.params.locale : DEFAULT_LOCALE
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
})

export default router
