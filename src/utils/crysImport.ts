import { relevantCrys, getSubCrystalises, subCrysTranslate, type Character, type CrystalisSelection } from '../types/KiokuTypes'

export type CrysImportMeta = {
    equipOrder?: string[]
}
export type CrysImportData = Record<string, Record<string, any>>

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
    oldUseIndex: number
    newUseIndex: number
    subSlots: CrysDiffSubSlot[]
    unmatched: string[]
}

export interface CrysDiffCharacter {
    char: Character
    items: CrysDiffItem[]
    equipOrderUnmatched: string[]
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

function splitMeta(entry: Record<string, any>): { meta?: CrysImportMeta; crysMap: Record<string, string[]> } {
    const { meta, ...crysMap } = entry
    return { meta, crysMap }
}

export function buildCrysImportDiff(characters: Character[], importData: CrysImportData): CrysDiffCharacter[] {
    const { descToId, idToLabel } = buildSubCrysMaps()

    const result: CrysDiffCharacter[] = []

    for (const [importCharName, rawEntry] of Object.entries(importData)) {
        const char = characters.find(c => c.name === importCharName)
        if (!char) continue

        const { meta, crysMap } = splitMeta(rawEntry)
        const equipOrder = meta?.equipOrder ?? null
        const allCrys = relevantCrys(char.id)

        const equipOrderUnmatched = equipOrder
            ? equipOrder.filter(name => name !== null && !allCrys.some(c => c.name === name))
            : []

        const items: CrysDiffItem[] = []

        for (const crys of allCrys) {
            const rawSubs: string[] | undefined = crysMap[crys.name]
            const impliedByEquip = !!equipOrder && rawSubs === undefined && equipOrder.includes(crys.name)
            const newEnabled = rawSubs !== undefined || impliedByEquip

            const existing = char.crysOptions[crys.selectionAbilityMstId]
            const oldEnabled = existing?.enabled ?? false
            const oldSubIds = existing?.subCrys?.length === 3 ? existing.subCrys : [0, 0, 0]
            const oldUseIndex = existing?.useIndex ?? 0

            const unmatched: string[] = []
            let newSubIds = oldSubIds

            if (newEnabled) {
                const padded = [...(rawSubs ?? [])].slice(0, 3)
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

            const newUseIndex = equipOrder
                ? (() => {
                    const idx = equipOrder.indexOf(crys.name)
                    return idx === -1 ? 0 : idx + 1
                })()
                : oldUseIndex

            const subSlots: CrysDiffSubSlot[] = [0, 1, 2].map(i => ({
                oldId: oldSubIds[i] ?? 0,
                newId: newSubIds[i] ?? 0,
                oldLabel: idToLabel[oldSubIds[i] ?? 0] ?? "—",
                newLabel: idToLabel[newSubIds[i] ?? 0] ?? "—",
                changed: (oldSubIds[i] ?? 0) !== (newSubIds[i] ?? 0),
            }))

            const enabledChanged = oldEnabled !== newEnabled
            const subChanged = subSlots.some(s => s.changed)
            const useIndexChanged = oldUseIndex !== newUseIndex

            if (!enabledChanged && !subChanged && !useIndexChanged) continue

            items.push({
                key: `${char.id}-${crys.selectionAbilityMstId}`,
                selectionAbilityMstId: crys.selectionAbilityMstId,
                crysName: crys.name,
                oldEnabled,
                newEnabled,
                oldUseIndex,
                newUseIndex,
                subSlots,
                unmatched,
            })
        }

        if (items.length) result.push({ char, items, equipOrderUnmatched })
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
            updatedOptions[item.selectionAbilityMstId] = {
                enabled: item.newEnabled,
                useIndex: item.newUseIndex,
                subCrys: item.subSlots.map(s => s.newId),
            }
        }

        updateChar({ ...char, crysOptions: updatedOptions })
    }
}
