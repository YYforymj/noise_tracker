import { db, type Session, type Reading } from '../db'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
const BUFFER_FLUSH_INTERVAL = 1000
const MAX_BUFFER_SIZE = 60

let readingBuffer: Reading[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useNoiseStorage() {
  function startSession(): string {
    const id = generateId()

    const session: Session = {
      id,
      startTime: Date.now(),
      endTime: 0,
      avgDb: 0,
      maxDb: 0,
      minDb: 0,
      duration: 0,
    }

    db.sessions.put(session)
    startBufferFlush()
    return id
  }

  function endSession(sessionId: string, stats: { avgDb: number; maxDb: number; minDb: number; duration: number }) {
    flushBuffer()

    db.sessions.update(sessionId, {
      endTime: Date.now(),
      avgDb: stats.avgDb,
      maxDb: stats.maxDb,
      minDb: stats.minDb,
      duration: stats.duration,
    })

    stopBufferFlush()
  }

  function saveReading(sessionId: string, timestamp: number, dbValue: number) {
    readingBuffer.push({
      id: generateId(),
      sessionId,
      timestamp,
      db: dbValue,
    })

    if (readingBuffer.length >= MAX_BUFFER_SIZE) {
      flushBuffer()
    }
  }

  function flushBuffer() {
    if (readingBuffer.length === 0) return
    const batch = readingBuffer.slice()
    readingBuffer = []
    db.readings.bulkPut(batch)
  }

  function startBufferFlush() {
    if (flushTimer) return
    flushTimer = setInterval(flushBuffer, BUFFER_FLUSH_INTERVAL)
  }

  function stopBufferFlush() {
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
  }

  async function getRecentSessions(limit = 20): Promise<Session[]> {
    const all = await db.sessions.orderBy('startTime').reverse().limit(limit).toArray()
    return all
  }

  async function getRecentReadings(sessionId: string, limit = 120): Promise<Reading[]> {
    const all = await db.readings
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp')
    return all.slice(-limit)
  }

  async function autoPurge() {
    const cutoff = Date.now() - THIRTY_DAYS
    await db.readings.where('timestamp').below(cutoff).delete()
  }

  return {
    startSession,
    endSession,
    saveReading,
    getRecentSessions,
    getRecentReadings,
    autoPurge,
  }
}