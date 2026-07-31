import { reactive } from 'vue'
import { Character } from '../types/KiokuTypes'
import { ScoreAttackKioku } from '../models/ScoreAttackKioku'

export interface DerivedStats {
  atk: number
  def: number
  hp: number
  pwr: number
}

// character id -> last-computed stats, keyed with a signature so we know when it's stale
const cache = reactive(new Map<string, { sig: string; stats: DerivedStats }>())

function signature(c: Character) {
  return `${c.ascension}|${c.kiokuLvl}|${c.magicLvl}|${c.heartphialLvl}|${c.specialLvl}|${JSON.stringify(c.crysOptions)}|${c.portrait}`
}

function computeStats(c: Character): DerivedStats {
  const kioku = new ScoreAttackKioku({ ...c, portrait: undefined })
  return {
    atk: kioku.getBaseAtk(),
    def: kioku.getBaseDef(),
    hp: kioku.getBaseHp(),
    pwr: kioku.getTotalPower(),
  }
}

// Reactive read — safe to call inside a computed, Vue tracks the Map access
export function getCachedStats(c: Character): DerivedStats | null {
  const entry = cache.get(c.id)
  return entry && entry.sig === signature(c) ? entry.stats : null
}

let queue: Character[] = []
const queued = new Set<string>()
let running = false

function idle(cb: (deadline: IdleDeadline) => void) {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(cb, { timeout: 200 })
  }
  return setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline), 16)
}

function processQueue(deadline: IdleDeadline) {
  while (queue.length && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
    const c = queue.shift()!
    queued.delete(c.id)
    if (!getCachedStats(c)) {
      cache.set(c.id, { sig: signature(c), stats: computeStats(c) })
    }
  }
  if (queue.length) idle(processQueue)
  else running = false
}

// priority: true jumps the character to the front (e.g. "user is looking at this card right now")
export function scheduleBackfill(characters: Character[], opts: { priority?: boolean } = {}) {
  for (const c of characters) {
    if (getCachedStats(c)) continue
    if (queued.has(c.id)) {
      if (opts.priority) {
        queue = queue.filter(x => x.id !== c.id)
        queue.unshift(c)
      }
      continue
    }
    queued.add(c.id)
    opts.priority ? queue.unshift(c) : queue.push(c)
  }
  if (!running && queue.length) {
    running = true
    idle(processQueue)
  }
}