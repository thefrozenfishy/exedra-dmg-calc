import { getEX, relevantCrys, getSubCrystalises, subCrysTranslate, type Character, type CrystalisSelection } from '../types/KiokuTypes'

export type CrysImportData = Record<string, Record<string, string[]>>

export interface CrysDiffSubSlot {
    oldId: number
    newId: number
    oldLabel: string
    newLabel: string
    changed: boolean
}

export interface CrysDiffItem {
    key: string
    selectionAbilityMstId: number
    crysName: string
    oldEnabled: boolean
    newEnabled: boolean
    subSlots: CrysDiffSubSlot[]
    unmatched: string[]
}

export interface CrysDiffCharacter {
    char: Character
    items: CrysDiffItem[]
}

function buildExNameToCharId(characters: Character[]): Record<string, number> {
    const map: Record<string, number> = {}
    for (const char of characters) {
        const ex = getEX(char.id)
        if (ex) map[ex.name] = char.id
    }
    return map
}

function buildSubCrysMaps() {
    const descToId: Record<string, number> = {}
    const idToLabel: Record<number, string> = {}
    for (const c of getSubCrystalises()) {
        descToId[c.description] = c.selectionAbilityMstId
        idToLabel[c.selectionAbilityMstId] = c.description || "—"
    }
    return { descToId, idToLabel }
}

export function buildCrysImportDiff(characters: Character[], importData: CrysImportData): CrysDiffCharacter[] {
    console.log("characters", characters, "importData", importData)
    const { descToId, idToLabel } = buildSubCrysMaps()

    const result: CrysDiffCharacter[] = []

    for (const [importCharName, crysMap] of Object.entries(importData)) {
        const char = characters.find(c => c.name === importCharName)
        if (!char) continue
        console.log(char, crysMap)

        const items: CrysDiffItem[] = []

        for (const crys of relevantCrys(char.id)) {
            const rawSubs = crysMap[crys.name]
            const newEnabled = rawSubs !== undefined

            const existing = char.crysOptions[crys.selectionAbilityMstId]
            const oldEnabled = existing?.enabled ?? false
            const oldSubIds = existing?.subCrys?.length === 3 ? existing.subCrys : [0, 0, 0]

            const unmatched: string[] = []
            let newSubIds = oldSubIds

            if (newEnabled) {
                const padded = [...rawSubs].slice(0, 3)
                while (padded.length < 3) padded.push("")

                newSubIds = padded.map(raw => {
                    if (!raw) return 0
                    const translated = subCrysTranslate(raw)
                    const id = descToId[translated]
                    if (id === undefined) {
                        unmatched.push(raw)
                        return 0
                    }
                    return id
                })
            }

            const subSlots: CrysDiffSubSlot[] = [0, 1, 2].map(i => ({
                oldId: oldSubIds[i] ?? 0,
                newId: newSubIds[i] ?? 0,
                oldLabel: idToLabel[oldSubIds[i] ?? 0] ?? "—",
                newLabel: idToLabel[newSubIds[i] ?? 0] ?? "—",
                changed: (oldSubIds[i] ?? 0) !== (newSubIds[i] ?? 0),
            }))

            const enabledChanged = oldEnabled !== newEnabled
            const subChanged = subSlots.some(s => s.changed)

            if (!enabledChanged && !subChanged) continue

            items.push({
                key: `${char.id}-${crys.selectionAbilityMstId}`,
                selectionAbilityMstId: crys.selectionAbilityMstId,
                crysName: crys.name,
                oldEnabled,
                newEnabled,
                subSlots,
                unmatched,
            })
        }

        if (items.length) result.push({ char, items })
    }

    return result.sort((a, b) => a.char.id - b.char.id)
}

export function applyCrysImportDiff(
    updateChar: (char: Character) => void,
    diffCharacters: CrysDiffCharacter[],
    selectedKeys: Set<string>
) {
    for (const { char, items } of diffCharacters) {
        const selectedItems = items.filter(i => selectedKeys.has(i.key))
        if (!selectedItems.length) continue

        const updatedOptions: Record<number, CrystalisSelection> = { ...char.crysOptions }
        for (const item of selectedItems) {
            const current = updatedOptions[item.selectionAbilityMstId]
            updatedOptions[item.selectionAbilityMstId] = {
                enabled: item.newEnabled,
                useIndex: current?.useIndex ?? 0,
                subCrys: item.subSlots.map(s => s.newId),
            }
        }

        updateChar({ ...char, crysOptions: updatedOptions })
    }
}
