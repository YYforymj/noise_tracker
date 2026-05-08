import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from '../ActionBar.vue'

describe('ActionBar', () => {
  const baseProps = { isPaused: false, isMonitoring: false, pauseLabel: '暂停监测', resumeLabel: '继续监测', startLabel: '开始监测', stopLabel: '■' }

  it('shows start label when not monitoring', () => {
    const wrapper = mount(ActionBar, { props: baseProps })
    expect(wrapper.find('.btn-pause.idle').text()).toBe('开始监测')
  })

  it('shows pause label when monitoring and not paused', () => {
    const wrapper = mount(ActionBar, { props: { ...baseProps, isMonitoring: true } })
    expect(wrapper.find('.btn-pause.active').text()).toBe('暂停监测')
  })

  it('shows resume label when paused', () => {
    const wrapper = mount(ActionBar, { props: { ...baseProps, isMonitoring: true, isPaused: true } })
    expect(wrapper.find('.btn-pause.paused').text()).toBe('继续监测')
  })

  it('emits toggle event on click', async () => {
    const wrapper = mount(ActionBar, { props: { ...baseProps, isMonitoring: true } })
    await wrapper.find('.btn-pause').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('shows stop button when monitoring', () => {
    const wrapper = mount(ActionBar, { props: { ...baseProps, isMonitoring: true } })
    expect(wrapper.find('.btn-stop').exists()).toBe(true)
  })

  it('hides stop button when not monitoring', () => {
    const wrapper = mount(ActionBar, { props: baseProps })
    expect(wrapper.find('.btn-stop').exists()).toBe(false)
  })

  it('emits stop event on stop click', async () => {
    const wrapper = mount(ActionBar, { props: { ...baseProps, isMonitoring: true } })
    await wrapper.find('.btn-stop').trigger('click')
    expect(wrapper.emitted('stop')).toBeTruthy()
  })
})