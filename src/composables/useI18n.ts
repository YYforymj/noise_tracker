import { computed, ref, watch } from 'vue'
import zh from '../locales/zh'
import en from '../locales/en'
import {
  applySeoMetadata,
  getAlternateLocale,
  getLocaleFromPath,
  getLocalePath,
  type Locale,
} from '../seo/site'

const STORAGE_KEY = 'noise-tracker-locale'

type NoiseLevelItem = {
  readonly db: string
  readonly desc: string
}

type FaqItem = {
  readonly q: string
  readonly a: string
}

type LocaleLeaf = string | readonly string[] | readonly NoiseLevelItem[] | readonly FaqItem[]
type LocaleMessages = { readonly [key: string]: LocaleLeaf | LocaleMessages }

const locales: Record<Locale, LocaleMessages> = { zh, en }

let initialized = false
const locale = ref<Locale>('zh')

function resetLocale() {
  initialized = false
  locale.value = 'zh'
}

function initLocale() {
  if (initialized) return
  initialized = true

  if (typeof window !== 'undefined') {
    locale.value = getLocaleFromPath(window.location.pathname)
    return
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  locale.value = stored === 'en' ? 'en' : 'zh'
}

watch(locale, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
  if (typeof document !== 'undefined') {
    applySeoMetadata(val)
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
  const alternateHref = computed(() => getLocalePath(getAlternateLocale(locale.value)))

  return { locale, t, raw, alternateHref, resetLocale }
}

export { locale }
export type { Locale }
