import { ref, watch } from 'vue'
import zh from '../locales/zh'
import en from '../locales/en'

type Locale = 'zh' | 'en'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LocaleData = Record<string, any>

const STORAGE_KEY = 'noise-tracker-locale'

const locales: Record<Locale, LocaleData> = { zh, en }

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
    document.title = val === 'zh'
      ? '在线噪音监测工具 - 实时分贝 dB 噪声检测'
      : 'Noise Monitor Online - Real-Time dB Noise Level Tracker'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', val === 'zh'
        ? '在线噪音监测工具，可实时检测环境噪声分贝 dB，查看最低、平均、最高噪音水平，适合日常环境噪声监控。'
        : 'Free online noise monitor - track real-time environmental sound levels in dB. Measure minimum, average, and maximum noise levels directly in your browser.',
      )
    }
  }
})

function resolve(key: string): unknown {
  const keys = key.split('.')
  let result: unknown = locales[locale.value]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in (result as object)) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return result
}

function t(key: string): string {
  const result = resolve(key)
  return typeof result === 'string' ? result : key
}

function raw<T = string | string[] | Array<{ db: string; desc: string } | { q: string; a: string }>>(key: string): T {
  return resolve(key) as T
}

export function useI18n() {
  initLocale()
  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return { locale, t, raw, toggleLocale, resetLocale }
}

export { locale }
export type { Locale }