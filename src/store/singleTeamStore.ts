import { defineStore } from 'pinia'
import { Character } from './characterStore'
import { EnemyTargetTypes } from '../Kioku'

export interface TeamSlot {
  main: Character | null
  support?: Character | null
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    slots: Array(5).fill(null).map(() => ({ main: null, support: null })) as TeamSlot[]
  }),
  actions: {
    setMain(slotIndex: number, member: Character) {
        if (member.ascension < 3) {
            member.specialLvl = Math.min(member.specialLvl, 4)
        } else if (member.ascension < 5) {
            member.specialLvl = Math.min(member.specialLvl, 7)
        }
      this.slots[slotIndex].main = member
      this.save()
    },
    setSupport(slotIndex: number, member: Character) {
        if (member.ascension < 3) {
            member.specialLvl = Math.min(member.specialLvl, 4)
        } else if (member.ascension < 5) {
            member.specialLvl = Math.min(member.specialLvl, 7)
        }
      this.slots[slotIndex].support = member
      this.save()
    },
    save() {
      localStorage.setItem('lastTeam', JSON.stringify(this.slots))
    },
    load() {
      const saved = localStorage.getItem('lastTeam')
      if (saved) {
        this.slots = JSON.parse(saved)
      }
    }
  }
})

export interface Enemy {
  name: string
  maxBreak: number
  defense: number
  enabled: boolean
  type: EnemyTargetTypes
}

export const useEnemyStore = defineStore('enemies', {
  state: () => ({
    // TODO make it so u can just choose an event/stage and it just pulls this from mst
    enemies: [
      { name: 'Other', type: EnemyTargetTypes.OTHER, maxBreak: 0, defense: 0, enabled: false },
      { name: 'Proximity', type: EnemyTargetTypes.PROXIMITY, maxBreak: 0, defense: 0, enabled: false },
      { name: 'Target', type: EnemyTargetTypes.TARGET, maxBreak: 0, defense: 0, enabled: true },
      { name: 'Proximity', type: EnemyTargetTypes.PROXIMITY, maxBreak: 0, defense: 0, enabled: false },
      { name: 'Other', type: EnemyTargetTypes.OTHER, maxBreak: 0, defense: 0, enabled: false }
    ] as Enemy[]
  }),
  actions: {
    updateEnemy(index: number, updated: Partial<Enemy>) {
      Object.assign(this.enemies[index], updated)
      this.save()
    },
    save() {
      localStorage.setItem('lastEnemies', JSON.stringify(this.enemies))
    },
    load() {
      const saved = localStorage.getItem('lastEnemies')
      if (saved) {
        this.enemies = JSON.parse(saved)
      }
    }
  }
})