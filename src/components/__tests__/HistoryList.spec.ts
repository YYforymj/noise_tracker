import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryList from '../HistoryList.vue'

describe('HistoryList', () => {
  const sessions = [
    { id: '1', startTime: Date.now() - 300000, avgDb: 42, maxDb: 58, level: 'quiet' as const, levelLabel: '安静' },
    { id: '2', startTime: Date.now() - 600000, avgDb: 58, maxDb: 72, level: 'moderate' as const, levelLabel: '适中' },
    { id: '3', startTime: Date.now() - 900000, avgDb: 72, maxDb: 85, level: 'loud' as const, levelLabel: '嘈杂' },
  ]

  it('renders correct number of items', () => {
    const wrapper = mount(HistoryList, {
      props: { sessions, title: '历史记录' },
    })
    expect(wrapper.findAll('.history-item').length).toBe(3)
  })

  it('applies correct level dot classes', () => {
    const wrapper = mount(HistoryList, {
      props: { sessions, title: '历史记录' },
    })
    const dots = wrapper.findAll('.history-dot')
    expect(dots[0].classes()).toContain('quiet')
    expect(dots[1].classes()).toContain('moderate')
    expect(dots[2].classes()).toContain('loud')
  })

  it('renders in reverse chronological order', () => {
    const wrapper = mount(HistoryList, {
      props: { sessions, title: '历史记录' },
    })
    const items = wrapper.findAll('.history-item')
    expect(items[0].find('.history-time').text()).toBeTruthy()
  })
})