import Dexie, { type EntityTable } from 'dexie'

interface Session {
  id: string
  startTime: number
  endTime: number
  avgDb: number
  maxDb: number
  minDb: number
  duration: number
}

interface Reading {
  id: string
  sessionId: string
  timestamp: number
  db: number
}

const db = new Dexie('NoiseTrackerDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  readings: EntityTable<Reading, 'id'>
}

db.version(1).stores({
  sessions: 'id, startTime',
  readings: 'id, sessionId, timestamp, [sessionId+timestamp]',
})

export type { Session, Reading }
export { db }