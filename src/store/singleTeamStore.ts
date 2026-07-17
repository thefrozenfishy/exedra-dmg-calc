import { defineStore } from 'pinia'
import { Enemy } from '../types/EnemyTypes'
import { TeamSlot } from '../types/BestTeamTypes'
import { Character, correctCharacterParams, relevantCrys } from '../types/KiokuTypes'

function normalizeCharacter(member?: Character) {
  if (!member) return undefined

  const corrected = correctCharacterParams(member) as Character

  return {
    ...corrected,
    crysOptions: Object.fromEntries(
      relevantCrys(corrected.id, true).map(cx => [
        cx.selectionAbilityMstId,
        {
          enabled: false,
          useIndex: 0,
          subCrys: [],
          ...(corrected.crysOptions?.[cx.selectionAbilityMstId] ?? {}),
        }
      ])
    ),
  }
}

let pvpPersistenceSubscribed = false
let teamPersistenceSubscribed = false

export const usePvPStore = defineStore('pvp', {
  state: () => ({
    slots: [
      Array(5).fill(null).map(() => ({})) as TeamSlot[],
      Array(5).fill(null).map(() => ({})) as TeamSlot[]
    ]
  }),
  actions: {
    setMain(isAlliedTeam: number) {
      return (slotIndex: number, member: Character | undefined) => {
        this.slots[isAlliedTeam][slotIndex].main = normalizeCharacter(member)
      }
    },
    setSupport(isAlliedTeam: number) {
      return (slotIndex: number, member: Character | undefined) => {
        this.slots[isAlliedTeam][slotIndex].support = normalizeCharacter(member)
      }
    },
    save() {
      localStorage.setItem('lastPvP', JSON.stringify(this.slots))
    },
    load() {
      const saved = localStorage.getItem('lastPvP')
      if (saved) {
        const parsed = JSON.parse(saved)

        this.slots = parsed.map((team: TeamSlot[]) =>
          team.map(slot => ({
            ...slot,
            main: normalizeCharacter(slot.main),
            support: normalizeCharacter(slot.support),
          }))
        )
      }

      if (!pvpPersistenceSubscribed) {
        pvpPersistenceSubscribed = true
        this.$subscribe(() => {
          this.save()
        }, { detached: true, flush: 'post' })
      }
    }
  }
})

export const useTeamStore = defineStore('team', {
  state: () => ({
    slots: Array(5).fill(null).map(() => ({})) as TeamSlot[]
  }),
  actions: {
    setCharBuffReduction(index: number, value?: number) {
      this.slots[index].buffMultReduction = value
    },
    setCharDebuffReduction(index: number, value?: number) {
      this.slots[index].debuffMultReduction = value
    },
    setMain(slotIndex: number, member: Character | undefined) {
      this.slots[slotIndex].main = normalizeCharacter(member)
    },
    setSupport(slotIndex: number, member: Character | undefined) {
      this.slots[slotIndex].support = normalizeCharacter(member)
    },
    save() {
      console.log("Saving")
      localStorage.setItem('lastTeam', JSON.stringify(this.slots))
    },
    load() {
      const saved = localStorage.getItem('lastTeam')
      if (saved) {
        const parsed = JSON.parse(saved)

        this.slots = parsed.map((slot: TeamSlot) => ({
          ...slot,
          main: normalizeCharacter(slot.main),
          support: normalizeCharacter(slot.support),
        }))
      }

      if (!teamPersistenceSubscribed) {
        teamPersistenceSubscribed = true
        this.$subscribe(() => {
          this.save()
        }, { detached: true, flush: 'post' })
      }
    }
  }
})

export const useEnemyStore = defineStore('enemies', {
  state: () => ({
    enemies: [
      { name: 'Left Other', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
      { name: 'Left Proximity', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
      { name: 'Target', maxBreak: 300, defense: 1500, enabled: true, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
      { name: 'Right Proximity', maxBreak: 0, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
      { name: 'Right Other', maxBreak: 300, defense: 1500, enabled: false, defenseUp: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 },
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
      if (!saved) return

      try {
        const parsed = JSON.parse(saved) as Partial<Enemy>[]

        this.enemies = this.enemies.map((defaultEnemy) => {
          const savedEnemy = parsed.find((e) => e.name === defaultEnemy.name)
          return savedEnemy ? { ...defaultEnemy, ...savedEnemy } : defaultEnemy
        })
      } catch (e) {
        console.error('Failed to load saved enemies, falling back to defaults', e)
      }
    }
  }
})