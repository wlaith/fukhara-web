import { config } from '@vue/test-utils'
import i18n from './i18n'

// Every mount() in the suite gets the real i18n instance, same as the app
config.global.plugins.push(i18n)
