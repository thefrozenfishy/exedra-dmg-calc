import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Character, KiokuConstants, correctCharacterParams } from '../types/KiokuTypes'
import { crystalises, kiokuData } from '../utils/helpers'
import debounce from "lodash.debounce"
import {
    saveCharacters,
    loadCharacters,
    createCloudUser,
    restoreCloudAccount
} from "../store/cloud"
import {
    createUserId,
    setUserId,
    getUserId
} from "../store/user"

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

    const charInfo: Record<string, Character> = Object.fromEntries(Object.entries(kiokuData).map(([name, data]) => [name, {
        name,
        id: data.id,
        role: data.role,
        element: data.element,
        supportTarget: data.support_target,
        supportDescription: data.support_effect,
        character_en: data.character_en,
        heartphial: data.heartphial || data.character_en,
        rarity: data.rarity,
        obtain: data.obtain,
        permaDate: data.permaDate,
        releaseDate: data.releaseDate,
    }]));

    const basicSetting = (ch) => ({
        enabled: ch.rarity !== 5 || ch.id === 10010101,
        dupes: 0,
        ...base,
    })

    const saved = localStorage.getItem('characters')
    if (saved) {
        const oldChars: Character[] = JSON.parse(saved)
        characters.value = oldChars.map(c => {
            c.crys = c?.crys?.filter(sc => ["EX", ...Object.values(crystalises).map(cr => cr.name)].includes(sc)) ?? []
            c.crys_sub = c?.crys_sub?.filter(sc => Object.values(crystalises).map(cr => cr.name).includes(sc)) ?? []
            if (c.ascension < 0) c.ascension = 0
            if (c.ascension > KiokuConstants.maxAscension) c.ascension = KiokuConstants.maxAscension
            if (c.rarity < KiokuConstants.maxAscension) c.ascension = KiokuConstants.maxAscension
            return c
        }).filter(k => "name" in k && "id" in k && "enabled" in k && "role" in k && "element" in k && "character_en" in k && "rarity" in k)
            .map(c => ({ ...basicSetting(c), ...Object.fromEntries(Object.entries(c).filter(([k, v]) => v != null)), ...charInfo[c.name] }))
    }

    const debouncedCloudSave = debounce(async () => {
        try {
            if (!getUserId()) return
            await saveCharacters(characters.value)
        } catch (err) {
            console.error(err)
        }
    }, 3000)

    watch(
        characters,
        (newVal) => {
            localStorage.setItem('characters', JSON.stringify(newVal))
            debouncedCloudSave()
        },
        { deep: true }
    )

    const applyCloudCharacters = (rows: any[]) => {
        rows.forEach((row) => {
            const char = characters.value.find(c => c.id === row.character_id)

            if (!char) return

            Object.assign(char, {
                enabled: row.enabled,

                dupes: row.dupes,
                ascension: row.ascension,

                kiokuLvl: row.kioku_lvl,
                magicLvl: row.magic_lvl,
                heartphialLvl: row.heartphial_lvl,
                specialLvl: row.special_lvl,

                portrait: row.portrait,

                crys: row.crys,
                crys_sub: row.crys_sub
            })
            if (char.rarity < 5) char.ascension = KiokuConstants.maxAscension;
            if (char.ascension < KiokuConstants.maxAscension) char.ascension = KiokuConstants.maxAscension;
            if (char.ascension < 0) char.ascension = 0;
        })
    }

    const createCloudAccount = async () => {
        const userId = createUserId()

        await createCloudUser(userId)

        await saveCharacters(characters.value)

        return userId
    }

    const loadExistingCloudAccount = async (userId: string) => {
        await restoreCloudAccount(userId)

        setUserId(userId)

        const rows = await loadCharacters()

        applyCloudCharacters(rows)
    }

    const initializeCloud = async () => {
        if (!getUserId()) return

        try {
            const rows = await loadCharacters()

            if (rows.length > 0) {
                applyCloudCharacters(rows)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const toggleCharacter = (id: number) => {
        const char = characters.value.find(c => c.id === id)
        if (char) char.enabled = !char.enabled
    }

    const updateChar = (char: Character) => {
        characters.value[characters.value.findIndex(c => c.id === char.id)] = correctCharacterParams(char);

        characters.value.forEach(c => {
            if (c.heartphial === char.heartphial) {
                c.heartphialLvl = char.heartphialLvl
            }
        })
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

    Object.entries(charInfo).forEach(([name, data]) => {
        if (!characters.value.map(c => c.name).includes(name)) characters.value.push({ ...basicSetting(data), ...data })
    });

    const mergeChars = (rows: Character[]) => rows.map(c => {
        const chInfo = Object.values(charInfo).find(ch => ch.id === c.id);
        if (!chInfo) return
        return { ...chInfo, ...c }
    })

    return {
        characters,
        toggleCharacter,
        updateChar,
        setCharacters,
        exportCharacters,
        importCharacters,
        createCloudAccount,
        loadExistingCloudAccount,
        initializeCloud,
        mergeChars,
    }
})
