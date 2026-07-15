export const SITE_ORIGIN = 'https://noisetracker.online' as const

const siteSeo = {
  appName: 'Noise Monitor Online',
  htmlLang: 'en',
  title: 'Noise Monitor Online - Real-Time dB Meter in Your Browser',
  description: 'Free online noise monitor for measuring environmental sound levels in dB. Track live, minimum, average, and maximum noise levels in your room, office, classroom, or outdoors.',
  ogTitle: 'Noise Monitor Online - Real-Time dB Meter in Your Browser',
  ogDescription: 'Measure live environmental noise levels in decibels with a free browser-based sound meter. Track trends, history, and common dB ranges instantly.',
  ogLocale: 'en_US',
} as const

export type Locale = 'en'

export function getAbsoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString()
}

export function getSeoForLocale(): typeof siteSeo {
  return siteSeo
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

export function applySeoMetadata(): void {
  const seo = getSeoForLocale()
  const canonicalUrl = getAbsoluteUrl('/')

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
}
