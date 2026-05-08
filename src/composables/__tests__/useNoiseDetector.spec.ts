import { describe, it, expect } from 'vitest'
import { computeRMS, computeDBFS, mapToRelative, classifyLevel } from '../useNoiseDetector'

describe('computeRMS', () => {
  it('returns 0 for silence', () => {
    const buffer = new Float32Array(2048)
    expect(computeRMS(buffer)).toBe(0)
  })

  it('returns 1 for full scale', () => {
    const buffer = new Float32Array(2048).fill(1)
    expect(computeRMS(buffer)).toBeCloseTo(1, 5)
  })

  it('returns ~0.707 for half amplitude sine', () => {
    const buffer = new Float32Array(2048).fill(0.7071)
    expect(computeRMS(buffer)).toBeCloseTo(0.7071, 3)
  })
})

describe('computeDBFS', () => {
  it('returns -100 for silence (floor)', () => {
    expect(computeDBFS(0)).toBeLessThanOrEqual(-100)
  })

  it('returns 0 for full scale (rms = 1)', () => {
    expect(computeDBFS(1)).toBeCloseTo(0, 1)
  })

  it('returns ~-6 for half amplitude (rms = 0.5)', () => {
    expect(computeDBFS(0.5)).toBeCloseTo(-6.02, 1)
  })

  it('never returns -Infinity', () => {
    expect(computeDBFS(1e-20)).toBeGreaterThan(-Infinity)
  })
})

describe('mapToRelative', () => {
  it('maps dBFS=0 to 120', () => {
    expect(mapToRelative(0)).toBe(120)
  })

  it('maps dBFS=-120 to 0', () => {
    expect(mapToRelative(-120)).toBe(0)
  })

  it('clamps values above 120', () => {
    expect(mapToRelative(10)).toBe(120)
  })

  it('clamps values below 0', () => {
    expect(mapToRelative(-130)).toBe(0)
  })
})

describe('classifyLevel', () => {
  it('classifies 0-50 as quiet', () => {
    expect(classifyLevel(0)).toBe('quiet')
    expect(classifyLevel(25)).toBe('quiet')
    expect(classifyLevel(49)).toBe('quiet')
  })

  it('classifies 50-70 as moderate', () => {
    expect(classifyLevel(50)).toBe('moderate')
    expect(classifyLevel(60)).toBe('moderate')
    expect(classifyLevel(69)).toBe('moderate')
  })

  it('classifies 70-85 as loud', () => {
    expect(classifyLevel(70)).toBe('loud')
    expect(classifyLevel(80)).toBe('loud')
    expect(classifyLevel(84)).toBe('loud')
  })

  it('classifies 85+ as danger', () => {
    expect(classifyLevel(85)).toBe('danger')
    expect(classifyLevel(100)).toBe('danger')
    expect(classifyLevel(120)).toBe('danger')
  })
})