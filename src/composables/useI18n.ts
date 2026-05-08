import { ref, watch } from 'vue'
import zh from '../locales/zh'
import en from '../locales/en'

type Locale = 'zh' | 'en'
type TranslationValue = string | number | boolean | null | TranslationTree
interface TranslationTree { [key: string]: TranslationValue }

const STORAGE_KEY = 'noise-tracker-locale'

const locales: Record<Locale, TranslationTree> = { zh, en }

let initialized = false
const locale = ref<Locale>('en')

function resetLocale() {
  initialized = false
  locale.value = 'en'
}

function initLocale() {
  if (initialized) return
  initialized = true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') {
    locale.value = stored
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    locale.value = navigator.language.startsWith('zh') ? 'zh' : 'en'
  }
}

watch(locale, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', val === 'zh' ? 'zh-CN' : 'en')
  }
})

function t(key: string): string {
  const keys = key.split('.')
  let result: unknown = locales[locale.value]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in (result as object)) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof result === 'string' ? result : key
}

export function useI18n() {
  initLocale()
  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return { locale, t, toggleLocale, resetLocale }
}

export { locale }
export type { Locale }