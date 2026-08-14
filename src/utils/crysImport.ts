import { relevantCrys, getSubCrystalises, subCrysTranslate, type Character, type CrystalisSelection } from '../types/KiokuTypes'

type CrysImportMeta = {
    equipOrder?: string[],
    kiokuLevel?: string | number,
    magicLevel?: string | number,
    specialLvl?: string | number,
    ascension?: string | number,
    version?: string,
}
export type CrysImportData = Record<string, Record<string, any>>

interface CrysDiffSubSlot {
    oldId: number
    newId: number
    oldLabel: string
    newLabel: string
    changed: boolean
}

interface CrysDiffItem {
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
    kiokuLvl?: number
    magicLvl?: number
    specialLvl?: number,
    ascension?: number,
    enabled?: boolean,
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

export function extractImportVersion(importData: CrysImportData): number {
    let highestVer = -Infinity
    for (const rawEntry of Object.values(importData)) {
        if (rawEntry?.meta?.version) {
            let ver = String(rawEntry.meta.version)
            if (ver.startsWith("v")) ver = ver.slice(1)
            if (ver === "DEV") ver = "1000"
            if (Number(ver) && Number(ver) > highestVer) highestVer = Number(ver)
        }
    }
    return highestVer
}

export function buildCrysImportDiff(characters: Character[], importData: CrysImportData): CrysDiffCharacter[] {
    const { descToId, idToLabel } = buildSubCrysMaps()

    const result: CrysDiffCharacter[] = []

    for (const [importCharName, rawEntry] of Object.entries(importData)) {
        const char = characters.find(c => c.name === importCharName)
        if (!char) continue

        const { meta, crysMap } = splitMeta(rawEntry)

        const equipOrder = meta?.equipOrder ?? null
        const importedKiokuLvl = meta?.kiokuLevel != null ? Number(meta.kiokuLevel) : undefined
        const importedMagicLvl = meta?.magicLevel != null ? Number(meta.magicLevel) : undefined
        const importedSpecialLvl = meta?.specialLvl != null ? Number(meta.specialLvl) : undefined
        const importedAscension = meta?.ascension != null ? Number(meta.ascension) : undefined

        const allCrys = relevantCrys(char.id)

        const equipOrderUnmatched = equipOrder
            ? equipOrder.filter(name => name !== null && !allCrys.some(c => c.name === name))
            : []

        const items: CrysDiffItem[] = []

        for (const crys of allCrys) {
            const rawSubs: string[] | undefined = crysMap[crys.name]
            const impliedByEquip = !!equipOrder && rawSubs == null && equipOrder.includes(crys.name)
            const newEnabled = rawSubs != null || impliedByEquip

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
                    if (id == null) {
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

        const kiokuChanged = importedKiokuLvl != null && !isNaN(importedKiokuLvl) && importedKiokuLvl !== char.kiokuLvl
        const magicChanged = importedMagicLvl != null && !isNaN(importedMagicLvl) && importedMagicLvl !== char.magicLvl
        const specialChanged = importedSpecialLvl != null && !isNaN(importedSpecialLvl) && importedSpecialLvl !== char.specialLvl
        const ascensionChanged = importedAscension != null && !isNaN(importedAscension) && importedAscension !== char.ascension

        if (items.length || kiokuChanged || magicChanged || specialChanged||ascensionChanged || !char.enabled) {
            result.push({
                char,
                items,
                equipOrderUnmatched,
                kiokuLvl: importedKiokuLvl,
                magicLvl: importedMagicLvl,
                specialLvl: importedSpecialLvl,
                ascension: importedAscension,
                enabled: char.enabled,
            })
        }
    }

    return result.sort((a, b) => a.char.id - b.char.id)
}

export function applyCrysImportDiff(
    updateChar: (char: Character) => void,
    diffCharacters: CrysDiffCharacter[],
    selectedKeys: Set<string>
) {
    for (const { char, items, kiokuLvl, magicLvl, specialLvl,ascension } of diffCharacters) {
        const selectedItems = items.filter(i => selectedKeys.has(i.key))
        if (items.length > 0 && !selectedItems.length) continue

        const updatedOptions: Record<number, CrystalisSelection> = { ...char.crysOptions }
        for (const item of selectedItems) {
            updatedOptions[item.selectionAbilityMstId] = {
                enabled: item.newEnabled,
                useIndex: item.newUseIndex,
                subCrys: item.subSlots.map(s => s.newId),
            }
        }

        const updatedChar: Character = {
            ...char,
            crysOptions: updatedOptions,
        }

        if (kiokuLvl != null && !isNaN(kiokuLvl)) {
            updatedChar.kiokuLvl = kiokuLvl
        }
        if (magicLvl != null && !isNaN(magicLvl)) {
            updatedChar.magicLvl = magicLvl
        }
        if (specialLvl != null && !isNaN(specialLvl)) {
            updatedChar.specialLvl = specialLvl
        }
        if (ascension != null && !isNaN(ascension)) {
            updatedChar.ascension = ascension
        }
        if (!char.enabled) {
            updatedChar.enabled = true
        }

        updateChar(updatedChar)
    }
}
