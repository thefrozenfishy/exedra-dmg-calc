import { defineStore } from 'pinia'
import { Character } from './characterStore'

export interface TeamSlot {
  main: Character | undefined
  support?: Character | undefined
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    slots: Array(5).fill(null).map(() => ({})) as TeamSlot[]
  }),
  actions: {
    setMain(slotIndex: number, member: Character | undefined) {
      if (member) {
        if (member.ascension < 3) {
          member.specialLvl = Math.min(member.specialLvl, 4)
        } else if (member.ascension < 5) {
          member.specialLvl = Math.min(member.specialLvl, 7)
        }
      }
      this.slots[slotIndex].main = member
      this.save()
    },
    setSupport(slotIndex: number, member: Character | undefined) {
      if (member) {
        if (member.ascension < 3) {
          member.specialLvl = Math.min(member.specialLvl, 4)
        } else if (member.ascension < 5) {
          member.specialLvl = Math.min(member.specialLvl, 7)
        }
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
  defenseUp: number
  hitsToKill: number
  enabled: boolean
  isBreak: boolean
  isWeak: boolean
  isCrit: boolean
}

export const useEnemyStore = defineStore('enemies', {
  state: () => ({
    // TODO make it so u can just choose an event/stage and it just pulls this from mst
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