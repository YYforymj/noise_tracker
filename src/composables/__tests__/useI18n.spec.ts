import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useI18n } from '../useI18n'
import { locale } from '../useI18n'
import { getLocaleFromPath } from '../../seo/site'

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
    locale.value = 'zh'
    window.history.replaceState({}, '', '/')
  })

  it('defaults to zh locale on the root path', () => {
    const { locale } = useI18n()
    expect(locale.value).toBe('zh')
  })

  it('derives en locale from the path', () => {
    expect(getLocaleFromPath('/en/')).toBe('en')
    expect(getLocaleFromPath('/')).toBe('zh')
  })

  it('resolves zh keys correctly', () => {
    const { t, locale } = useI18n()
    locale.value = 'zh'
    expect(t('app.title')).toBe('在线噪音监测工具')
    expect(t('level.quiet')).toBe('安静')
    expect(t('btn.pause')).toBe('暂停监测')
  })

  it('resolves en keys correctly', () => {
    const { t, locale } = useI18n()
    locale.value = 'en'
    expect(t('app.title')).toBe('Noise Monitor Online')
    expect(t('level.quiet')).toBe('Quiet')
    expect(t('btn.pause')).toBe('Pause')
  })

  it('persists locale to localStorage', async () => {
    const { locale } = useI18n()
    locale.value = 'en'
    await nextTick()
    expect(localStorage.getItem('noise-tracker-locale')).toBe('en')
  })

  it('returns key for unknown path', () => {
    const { t } = useI18n()
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })
})
