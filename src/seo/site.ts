export const SITE_ORIGIN = 'https://noisetracker.online' as const

const localePaths = {
  zh: '/',
  en: '/en/',
} as const

const localeSeo = {
  zh: {
    appName: '在线噪音监测工具',
    htmlLang: 'zh-CN',
    title: '在线噪音监测工具 - 实时分贝 dB 测试',
    description: '免费在线噪音监测工具，实时检测环境噪声分贝 dB，查看最低、平均、最高噪音水平，适合房间、办公室、教室和日常环境噪音测试。',
    ogTitle: '在线噪音监测工具 - 实时分贝 dB 测试',
    ogDescription: '浏览器直接检测环境噪音分贝，支持实时监测、历史记录和常见噪音等级参考。',
    ogLocale: 'zh_CN',
  },
  en: {
    appName: 'Noise Monitor Online',
    htmlLang: 'en',
    title: 'Noise Monitor Online - Real-Time dB Meter in Your Browser',
    description: 'Free online noise monitor for measuring environmental sound levels in dB. Track live, minimum, average, and maximum noise levels in your room, office, classroom, or outdoors.',
    ogTitle: 'Noise Monitor Online - Real-Time dB Meter in Your Browser',
    ogDescription: 'Measure live environmental noise levels in decibels with a free browser-based sound meter. Track trends, history, and common dB ranges instantly.',
    ogLocale: 'en_US',
  },
} as const

export type Locale = keyof typeof localePaths
type LocaleSeo = (typeof localeSeo)[Locale]

function normalizePathname(pathname: string): string {
  if (pathname === '') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function getLocaleFromPath(pathname: string): Locale {
  const normalizedPath = normalizePathname(pathname)
  return normalizedPath.startsWith('/en/') ? 'en' : 'zh'
}

export function getLocalePath(locale: Locale): string {
  return localePaths[locale]
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh'
}

export function getAbsoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString()
}

export function getSeoForLocale(locale: Locale): LocaleSeo {
  return localeSeo[locale]
}

function updateMeta(selector: string, content: string): void {
  const element = document.head.querySelector<HTMLMetaElement>(selector)
  if (element) {
    element.content = content
  }
}

function updateLink(selector: string, href: string): void {
  const element = document.head.querySelector<HTMLLinkElement>(selector)
  if (element) {
    element.href = href
  }
}

export function applySeoMetadata(locale: Locale): void {
  const seo = getSeoForLocale(locale)
  const canonicalUrl = getAbsoluteUrl(getLocalePath(locale))
  const englishUrl = getAbsoluteUrl(getLocalePath('en'))
  const chineseUrl = getAbsoluteUrl(getLocalePath('zh'))

  document.documentElement.lang = seo.htmlLang
  document.title = seo.title

  updateMeta('meta[name="description"]', seo.description)
  updateMeta('meta[property="og:title"]', seo.ogTitle)
  updateMeta('meta[property="og:description"]', seo.ogDescription)
  updateMeta('meta[property="og:url"]', canonicalUrl)
  updateMeta('meta[property="og:locale"]', seo.ogLocale)
  updateMeta('meta[name="twitter:title"]', seo.ogTitle)
  updateMeta('meta[name="twitter:description"]', seo.ogDescription)
  updateLink('link[rel="canonical"]', canonicalUrl)
  updateLink('link[rel="alternate"][hreflang="en"]', englishUrl)
  updateLink('link[rel="alternate"][hreflang="zh-CN"]', chineseUrl)
  updateLink('link[rel="alternate"][hreflang="x-default"]', englishUrl)
}
