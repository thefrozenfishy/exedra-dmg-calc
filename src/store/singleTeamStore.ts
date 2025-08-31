import { defineStore } from 'pinia'
import { Enemy } from '../types/EnemyTypes'
import { TeamSlot } from '../types/BestTeamTypes'
import { Character, correctCharacterParams } from '../types/KiokuTypes'

export const usePvPStore = defineStore('pvp', {
  state: () => ({
    slots: [
      Array(5).fill(null).map(() => ({})) as TeamSlot[],
      Array(5).fill(null).map(() => ({})) as TeamSlot[]
    ]
  }),
  actions: {
    setMain(slotIndex: number, isAlliedTeam: number, member: Character | undefined) {
      this.slots[isAlliedTeam][slotIndex].main = correctCharacterParams(member)
      this.save()
    },
    setSupport(slotIndex: number, isAlliedTeam: number, member: Character | undefined) {
      this.slots[isAlliedTeam][slotIndex].support = correctCharacterParams(member)
      this.save()
    },
    save() {
      localStorage.setItem('lastPvP', JSON.stringify(this.slots))
    },
    load() {
      const saved = localStorage.getItem('lastPvP')
      if (saved) {
        this.slots = JSON.parse(saved)
      }
    }
  }
})
export const useTeamStore = defineStore('team', {
  state: () => ({
    slots: Array(5).fill(null).map(() => ({})) as TeamSlot[]
  }),
  actions: {
    setMain(slotIndex: number, member: Character | undefined) {
      this.slots[slotIndex].main = correctCharacterParams(member)
      this.save()
    },
    setSupport(slotIndex: number, member: Character | undefined) {
      this.slots[slotIndex].support = correctCharacterParams(member)
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

export const useEnemyStore = defineStore('enemies', {
  state: () => ({
    enemies: [
      { name: 'Left Other', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, hitsToKill: 1 },
      { name: 'Left Proximity', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, hitsToKill: 1 },
      { name: 'Target', maxBreak: 300, defense: 1500, enabled: true, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, hitsToKill: 1 },
      { name: 'Right Proximity', maxBreak: 0, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, hitsToKill: 1 },
      { name: 'Right Other', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, hitsToKill: 1 }
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