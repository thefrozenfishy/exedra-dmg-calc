import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Character, KiokuConstants, correctCharacterParams } from '../types/KiokuTypes'
import { crystalises, kiokuData } from '../utils/helpers'

const base = {
    ascension: KiokuConstants.maxAscension,
    portrait: "",
    kiokuLvl: KiokuConstants.maxKiokuLvl,
    magicLvl: KiokuConstants.maxMagicLvl,
    heartphialLvl: KiokuConstants.maxHeartphialLvl,
    specialLvl: KiokuConstants.maxSpecialLvl,
    crys: ["EX"],
    crys_sub: KiokuConstants.optimal_attacker_crys_sub
}

export const useCharacterStore = defineStore('characterStore', () => {
    const characters = ref<Character[]>([])

    const baseChars: Record<string, Character> = Object.fromEntries(Object.entries(kiokuData).map(([name, data]) => [name, {
        name,
        id: data.id,
        enabled: data.rarity !== 5 || data.id === 10010101,
        role: data.role,
        element: data.element,
        supportTarget: data.support_target,
        supportDescription: data.support_effect,
        character_en: data.character_en,
        rarity: data.rarity,
        ...base,
    }]));

    const saved = localStorage.getItem('characters')
    if (saved) {
        const oldChars: Character[] = JSON.parse(saved)
        characters.value = oldChars.map(c => {
            c.crys = c?.crys?.filter(sc => ["EX", ...Object.values(crystalises).map(cr => cr.name)].includes(sc)) ?? []
            c.crys_sub = c?.crys_sub?.filter(sc => Object.values(crystalises).map(cr => cr.name).includes(sc)) ?? []
            return c
        }).filter(k => "name" in k && "id" in k && "enabled" in k && "role" in k && "element" in k && "character_en" in k && "rarity" in k)
            .map(c => ({ ...baseChars[c.name], ...Object.fromEntries(Object.entries(c).filter(([k, v]) => v != null)) }))
    }

    watch(
        characters,
        (newVal) => {
            localStorage.setItem('characters', JSON.stringify(newVal))
        },
        { deep: true }
    )

    const toggleCharacter = (id: number) => {
        const char = characters.value.find(c => c.id === id)
        if (char) char.enabled = !char.enabled
    }

    const updateChar = (char: Character) => {
        characters.value[characters.value.findIndex(c => c.id === char.id)] = correctCharacterParams(char);
    }

    const setCharacters = (chars: Character[]) => {
        chars.forEach(updateChar)
    }

    const exportCharacters = () => {
        const dataStr = JSON.stringify(characters.value, null, 2) // pretty JSON
        const blob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "exedraDmgCalcTeam.json"
        a.click()

        URL.revokeObjectURL(url)
    }

    const importCharacters = (file: File) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target?.result as string)
                    if (Array.isArray(parsed)) {
                        setCharacters(parsed)
                        resolve()
                    } else {
                        reject(new Error("Invalid file format"))
                    }
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsText(file)
        })
    }

    Object.entries(baseChars).forEach(([name, data]) => {
        if (!characters.value.map(c => c.name).includes(name)) characters.value.push(data)
    });

    return { characters, toggleCharacter, updateChar, setCharacters, exportCharacters, importCharacters }
})
