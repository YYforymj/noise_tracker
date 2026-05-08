import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DbCard from '../DbCard.vue'

describe('DbCard', () => {
  it('renders correct dB value', () => {
    const wrapper = mount(DbCard, {
      props: { dbValue: 42, level: 'quiet', levelLabel: '安静' },
    })
    expect(wrapper.find('.db-value').text()).toBe('42')
    expect(wrapper.find('.db-unit').text()).toBe('dB')
  })

  it('applies correct level class', () => {
    const wrapper = mount(DbCard, {
      props: { dbValue: 42, level: 'moderate', levelLabel: '适中' },
    })
    expect(wrapper.find('.db-label').classes()).toContain('moderate')
  })

  it('displays correct level label text', () => {
    const wrapper = mount(DbCard, {
      props: { dbValue: 42, level: 'quiet', levelLabel: '安静' },
    })
    expect(wrapper.find('.db-label').text()).toContain('安静')
  })
})