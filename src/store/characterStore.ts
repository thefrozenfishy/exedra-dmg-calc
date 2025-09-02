import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Character, KiokuConstants, correctCharacterParams } from '../types/KiokuTypes'
import { crystalises, kiokuData } from '../utils/helpers'

export const useCharacterStore = defineStore('characterStore', () => {
    const characters = ref<Character[]>([])

    // Load from localStorage if exists
    const saved = localStorage.getItem('characters')
    if (saved) {
        const oldChars: Character[] = JSON.parse(saved)
        characters.value = oldChars.map(c => {
            c.crys = c?.crys?.filter(sc => ["EX", ...Object.values(crystalises).map(cr => cr.name)].includes(sc))
            c.crys_sub = c?.crys_sub?.filter(sc => Object.values(crystalises).map(cr => cr.name).includes(sc))
            return c
        })

    }

    // Watch and save to localStorage
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

    // Add new characters
    Object.entries(kiokuData).forEach(([name, data]) => {
        if (!characters.value.map(c => c.name).includes(name)) {
            characters.value.push({
                name,
                id: data.id,
                enabled: data.rarity !== 5 || data.id === 10010101,
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
                crys: ["EX"],
                crys_sub: Array(3).fill(["Increases critical rate by 5%.", "Increases critical DMG by 10%.", "Increases ATK by 60."]).flat()
            })
        }
    });

    return { characters, toggleCharacter, updateChar, setCharacters, exportCharacters, importCharacters }
})
