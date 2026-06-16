import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// On Vercel serverless, /tmp is writable. Locally use the data/ folder.
const DATA_DIR = process.env.VERCEL ? '/tmp/watch-data' : path.join(process.cwd(), 'data')
const SECRET = 'watch_jwt_secret_2024'

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) }
function readJson<T>(file: string, fallback: T): T {
  ensureDir()
  const p = path.join(DATA_DIR, file)
  // On Vercel, also check the bundled data/ folder for seed data
  const bundled = path.join(process.cwd(), 'data', file)
  const target = fs.existsSync(p) ? p : (fs.existsSync(bundled) ? bundled : null)
  if (!target) return fallback
  try { return JSON.parse(fs.readFileSync(target, 'utf-8')) } catch { return fallback }
}
function writeJson<T>(file: string, data: T) {
  ensureDir()
  try { fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2)) } catch { /* read-only fs */ }
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

// Self-verifying token — no in-memory store needed (works across serverless instances)
export function generateToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (sig !== expected) return null
    const { userId } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return userId ?? null
  } catch { return null }
}

// No-op — tokens are now self-verifying
export function saveToken(_token: string, _userId: string) {}
export function deleteToken(_token: string) {}

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
    getByUser: (userId: string) =>
      readJson<DbWatchlistItem[]>('watchlist.json', [])
        .filter(w => w.userId === userId)
        .map(w => w.movie),
    add: (userId: string, movie: object) => {
      const all = readJson<DbWatchlistItem[]>('watchlist.json', [])
      const movieId = (movie as any).id
      if (!all.find(w => w.userId === userId && (w.movie as any).id === movieId)) {
        all.unshift({ userId, movie })
        writeJson('watchlist.json', all)
      }
    },
    remove: (userId: string, movieId: number) => {
      writeJson('watchlist.json',
        readJson<DbWatchlistItem[]>('watchlist.json', [])
          .filter(w => !(w.userId === userId && (w.movie as any).id === movieId))
      )
    },
  },
  progress: {
    getByUser: (userId: string): DbProgressItem[] =>
      readJson<DbProgressItem[]>('progress.json', []).filter(p => p.userId === userId),
    save: (item: DbProgressItem) => {
      const all = readJson<DbProgressItem[]>('progress.json', [])
        .filter(p => !(p.userId === item.userId && p.movie_id === item.movie_id))
      all.unshift(item)
      writeJson('progress.json', all.slice(0, 200))
    },
    remove: (userId: string, movieId: number) => {
      writeJson('progress.json',
        readJson<DbProgressItem[]>('progress.json', [])
          .filter(p => !(p.userId === userId && p.movie_id === movieId))
      )
    },
  },
}
