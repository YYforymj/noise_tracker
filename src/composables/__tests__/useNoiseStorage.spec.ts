import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { useNoiseStorage } from '../useNoiseStorage'

describe('useNoiseStorage', () => {
  beforeEach(async () => {
    await db.readings.clear()
    await db.sessions.clear()
  })

  it('creates and retrieves a session', async () => {
    const { startSession, getRecentSessions } = useNoiseStorage()

    const id = startSession()
    expect(id).toBeTruthy()

    const sessions = await getRecentSessions(10)
    expect(sessions.length).toBe(1)
    expect(sessions[0].id).toBe(id)
  })

  it('updates a session with stats on endSession', async () => {
    const { startSession, endSession, getRecentSessions } = useNoiseStorage()

    const id = startSession()
    await endSession(id, { avgDb: 42, maxDb: 58, minDb: 28, duration: 120 })

    const sessions = await getRecentSessions(10)
    expect(sessions[0].avgDb).toBe(42)
    expect(sessions[0].maxDb).toBe(58)
    expect(sessions[0].minDb).toBe(28)
    expect(sessions[0].duration).toBe(120)
  })

  it('returns sessions in reverse chronological order', async () => {
    const { startSession, endSession, getRecentSessions } = useNoiseStorage()

    const id1 = startSession()
    await endSession(id1, { avgDb: 30, maxDb: 40, minDb: 20, duration: 60 })

    await new Promise(r => setTimeout(r, 50))

    const id2 = startSession()
    await endSession(id2, { avgDb: 50, maxDb: 60, minDb: 35, duration: 90 })

    const sessions = await getRecentSessions(10)
    expect(sessions[0].avgDb).toBe(50)
    expect(sessions[1].avgDb).toBe(30)
  })

  it('bulk-puts readings and retrieves them', async () => {
    const { startSession, saveReading, getRecentReadings, endSession } = useNoiseStorage()

    const id = startSession()
    const now = Date.now()
    for (let i = 0; i < 10; i++) {
      saveReading(id, now - (10 - i) * 1000, 40 + i)
    }
    await endSession(id, { avgDb: 44, maxDb: 49, minDb: 40, duration: 10 })

    const readings = await getRecentReadings(id)
    expect(readings.length).toBe(10)
  })

  it('auto-purges readings older than 30 days but keeps session metadata', async () => {
    const { startSession, saveReading, endSession, autoPurge, getRecentSessions, getRecentReadings } = useNoiseStorage()

    const id = startSession()
    const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000
    const recentTimestamp = Date.now() - 1000

    saveReading(id, oldTimestamp, 30)
    saveReading(id, recentTimestamp, 45)
    await endSession(id, { avgDb: 37, maxDb: 45, minDb: 30, duration: 60 })

    await autoPurge()

    const sessions = await getRecentSessions()
    expect(sessions.length).toBe(1)

    const readings = await getRecentReadings(id)
    expect(readings.length).toBe(1)
    expect(readings[0].db).toBe(45)
  })
})