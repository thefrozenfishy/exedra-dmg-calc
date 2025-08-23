import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { kiokuData } from '../helpers'
import { KiokuConstants } from '../Kioku'

export interface Character {
    id: string
    name: string
    character_en: string
    enabled: boolean
    ascension: number
    element: string
    role: string
    rarity: number
    portrait: string
    kiokuLvl: number
    magicLvl: number
    heartphialLvl: number
    specialLvl: number
    crys: string[]
}

export const useCharacterStore = defineStore('characterStore', () => {
    const characters = ref<Character[]>([])

    // Load from localStorage if exists
    const saved = localStorage.getItem('characters')
    if (saved) { characters.value = JSON.parse(saved) }

    // Watch and save to localStorage
    watch(
        characters,
        (newVal) => {
            localStorage.setItem('characters', JSON.stringify(newVal))
        },
        { deep: true }
    )

    const toggleCharacter = (id: string) => {
        const char = characters.value.find(c => c.id === id)
        if (char) char.enabled = !char.enabled
    }

    const updateChar = (char: Character) => {
        if (char.ascension < 3) {
            char.specialLvl = Math.min(char.specialLvl, 4)
        } else if (char.ascension < 5) {
            char.specialLvl = Math.min(char.specialLvl, 7)
        }
        characters.value[characters.value.findIndex(c => c.id === char.id)] = char;
    }

    const setCharacters = (chars: Character[]) => {
        chars.forEach(updateChar)
    }

    // Add new characters
    Object.entries(kiokuData).forEach(([name, data]) => {
        if (!characters.value.map(c => c.name).includes(name)) {
            characters.value.push({
                name,
                id: data.id,
                enabled: data.rarity !== 5 || data.id === 100101,
                role: data.role,
                element: data.element,
                character_en: data.character_en,
                rarity: data.rarity,
                ascension: KiokuConstants.maxAscension,
                portrait: "",
                kiokuLvl: KiokuConstants.maxKiokuLvl,
                magicLvl: KiokuConstants.maxMagicLvl,
                heartphialLvl: KiokuConstants.maxHeartphialLvl,
                specialLvl: KiokuConstants.maxSpecialLvl,
                crys: [KiokuConstants.availableCrys.EX],

            })
        }
    });

    return { characters, toggleCharacter, updateChar, setCharacters }
})
