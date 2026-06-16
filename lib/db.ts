import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) }
function readJson<T>(file: string, fallback: T): T {
  ensureDir()
  const p = path.join(DATA_DIR, file)
  if (!fs.existsSync(p)) return fallback
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return fallback }
}
function writeJson<T>(file: string, data: T) {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

export interface DbUser {
  id: string
  name: string
  email: string
  passwordHash: string
  avatar: number
  created_at: string
}

export interface DbWatchlistItem {
  userId: string
  movie: object
}

export interface DbProgressItem {
  userId: string
  movie_id: number
  progress_seconds: number
  duration_seconds: number
  percent: number
  movie: object
  updated_at: string
}

export function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password + 'watch_salt').digest('hex')
}

export function generateToken(userId: string) {
  return crypto.createHash('sha256').update(userId + Date.now() + 'watch_secret').digest('hex')
}

// Simple in-memory token store (resets on server restart — fine for dev)
const tokens = new Map<string, string>() // token → userId

export function saveToken(token: string, userId: string) { tokens.set(token, userId) }
export function getUserIdFromToken(token: string): string | null { return tokens.get(token) ?? null }
export function deleteToken(token: string) { tokens.delete(token) }

export const db = {
  users: {
    getAll: (): DbUser[] => readJson('users.json', []),
    findByEmail: (email: string) => readJson<DbUser[]>('users.json', []).find(u => u.email === email),
    findById: (id: string) => readJson<DbUser[]>('users.json', []).find(u => u.id === id),
    create: (user: DbUser) => {
      const users = readJson<DbUser[]>('users.json', [])
      users.push(user)
      writeJson('users.json', users)
      return user
    },
  },
  watchlist: {
    getByUser: (userId: string) => readJson<DbWatchlistItem[]>('watchlist.json', []).filter(w => w.userId === userId).map(w => w.movie),
    add: (userId: string, movie: object) => {
      const all = readJson<DbWatchlistItem[]>('watchlist.json', [])
      const movieId = (movie as any).id
      if (!all.find(w => w.userId === userId && (w.movie as any).id === movieId)) {
        all.unshift({ userId, movie })
        writeJson('watchlist.json', all)
      }
    },
    remove: (userId: string, movieId: number) => {
      const all = readJson<DbWatchlistItem[]>('watchlist.json', []).filter(
        w => !(w.userId === userId && (w.movie as any).id === movieId)
      )
      writeJson('watchlist.json', all)
    },
  },
  progress: {
    getByUser: (userId: string): DbProgressItem[] => readJson<DbProgressItem[]>('progress.json', []).filter(p => p.userId === userId),
    save: (item: DbProgressItem) => {
      const all = readJson<DbProgressItem[]>('progress.json', []).filter(
        p => !(p.userId === item.userId && p.movie_id === item.movie_id)
      )
      all.unshift(item)
      writeJson('progress.json', all.slice(0, 200))
    },
    remove: (userId: string, movieId: number) => {
      const all = readJson<DbProgressItem[]>('progress.json', []).filter(
        p => !(p.userId === userId && p.movie_id === movieId)
      )
      writeJson('progress.json', all)
    },
  },
}
