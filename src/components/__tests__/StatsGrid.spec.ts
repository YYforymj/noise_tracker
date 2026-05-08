import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsGrid from '../StatsGrid.vue'

describe('StatsGrid', () => {
  const labels = { min: '最低', avg: '平均', max: '最高', duration: '时长' }

  it('renders all 4 stat cards with correct values', () => {
    const wrapper = mount(StatsGrid, {
      props: { minDb: 28, avgDb: 39, maxDb: 58, duration: '12', labels, dbUnit: ' dB', minUnit: ' min' },
    })
    const cards = wrapper.findAll('.stat-card')
    expect(cards.length).toBe(4)
    expect(cards[0].find('.stat-value').text()).toContain('28')
    expect(cards[1].find('.stat-value').text()).toContain('39')
  })

  it('updates when props change', async () => {
    const wrapper = mount(StatsGrid, {
      props: { minDb: 28, avgDb: 39, maxDb: 58, duration: '12', labels, dbUnit: ' dB', minUnit: ' min' },
    })
    await wrapper.setProps({ minDb: 35 })
    expect(wrapper.findAll('.stat-card')[0].find('.stat-value').text()).toContain('35')
  })
})