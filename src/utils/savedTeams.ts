import type { TeamSlot } from "../types/BestTeamTypes"
import { KiokuConstants, type Character, type CrystalisSelection } from "../types/KiokuTypes"
import type { SavedTeam, SavedTeamKind, SavedTeamMember, SavedTeamRow, SavedTeamSlot } from "../types/SavedTeamTypes"
import { portraits } from "./helpers"
import { clampName } from "./tierList"

export const SLOTS_PER_TEAM = 5
export const TEAMS_PER_KIND: Record<SavedTeamKind, number> = { single: 1, pvp: 2 }

const MAX_CRYS_OPTIONS = 20
const MAX_SUB_CRYS = 20

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number =>
    typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback

const isId = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0 && (value as number) < 1e9

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

function sanitizeCrys(raw: unknown): CrystalisSelection | null {
    const c = asRecord(raw)
    const selection: CrystalisSelection = {
        enabled: c.enabled === true,
        useIndex: clampInt(c.useIndex, 0, 10, 0),
        subCrys: (Array.isArray(c.subCrys) ? c.subCrys : []).filter(isId).slice(0, MAX_SUB_CRYS),
    }
    if (c.locked === true) selection.locked = true
    // Untouched defaults are filled back in when a team is loaded, so they aren't stored.
    return selection.enabled || selection.useIndex > 0 || selection.subCrys.length || selection.locked ? selection : null
}

/**
 * Team JSON can come from other users (shared links) or from a cloud row, so nothing in it is
 * trusted: every field is coerced into range, unknown portraits are dropped and ids must be integers.
 */
function sanitizeMember(raw: unknown): SavedTeamMember | undefined {
    const m = asRecord(raw)
    if (!isId(m.id)) return undefined

    const crysIn = asRecord(m.crysOptions)
    const crysOptions: Record<string, CrystalisSelection> = {}
    for (const key of Object.keys(crysIn).slice(0, MAX_CRYS_OPTIONS)) {
        if (!isId(Number(key))) continue
        const selection = sanitizeCrys(crysIn[key])
        if (selection) crysOptions[String(Number(key))] = selection
    }

    const member: SavedTeamMember = {
        id: m.id,
        ascension: clampInt(m.ascension, -1, KiokuConstants.maxAscension, KiokuConstants.minAscension),
        kiokuLvl: clampInt(m.kiokuLvl, KiokuConstants.minKiokuLvl, KiokuConstants.maxKiokuLvl, KiokuConstants.minKiokuLvl),
        magicLvl: clampInt(m.magicLvl, KiokuConstants.minMagicLvl, KiokuConstants.maxMagicLvl, KiokuConstants.minMagicLvl),
        heartphialLvl: clampInt(m.heartphialLvl, KiokuConstants.minHeartphialLvl, KiokuConstants.maxHeartphialLvl, KiokuConstants.minHeartphialLvl),
        specialLvl: clampInt(m.specialLvl, KiokuConstants.minSpecialLvl, KiokuConstants.maxSpecialLvl, KiokuConstants.minSpecialLvl),
        crysOptions,
    }
    if (typeof m.portrait === "string" && hasOwn(portraits, m.portrait)) member.portrait = m.portrait
    return member
}

function sanitizeSlot(raw: unknown): SavedTeamSlot {
    const s = asRecord(raw)
    const slot: SavedTeamSlot = {}
    const main = sanitizeMember(s.main)
    const support = sanitizeMember(s.support)
    if (main) slot.main = main
    if (support) slot.support = support
    if (typeof s.buffMultReduction === "number" && Number.isFinite(s.buffMultReduction)) slot.buffMultReduction = s.buffMultReduction
    if (typeof s.debuffMultReduction === "number" && Number.isFinite(s.debuffMultReduction)) slot.debuffMultReduction = s.debuffMultReduction
    return slot
}

/** Always returns TEAMS_PER_KIND[kind] teams of SLOTS_PER_TEAM slots. */
export function sanitizeTeamSlots(raw: unknown, kind: SavedTeamKind): SavedTeamSlot[][] {
    const teams = Array.isArray(raw) ? raw : []
    return Array.from({ length: TEAMS_PER_KIND[kind] }, (_, t) => {
        const slots = Array.isArray(teams[t]) ? teams[t] : []
        return Array.from({ length: SLOTS_PER_TEAM }, (_, i) => sanitizeSlot(slots[i]))
    })
}

/** Simulator slots -> the compact form that is stored and shared. */
export function compactTeams(teams: TeamSlot[][], kind: SavedTeamKind): SavedTeamSlot[][] {
    return sanitizeTeamSlots(teams, kind)
}

/** Stored slots -> simulator slots. Static character data (name, element, role, ...) comes from `catalog`. */
export function expandTeams(teams: SavedTeamSlot[][], catalog: Map<number, Character>): TeamSlot[][] {
    const expand = (m?: SavedTeamMember): Character | undefined => {
        const base = m && catalog.get(m.id)
        if (!m || !base) return undefined
        return { ...base, ...m, portrait: m.portrait ?? "", crysOptions: JSON.parse(JSON.stringify(m.crysOptions)) }
    }
    return teams.map(team => team.map(slot => ({
        main: expand(slot.main),
        support: expand(slot.support),
        buffMultReduction: slot.buffMultReduction,
        debuffMultReduction: slot.debuffMultReduction,
    })))
}

/** Stable key for "is this the same team?" comparisons. */
export const teamsKey = (teams: SavedTeamSlot[][]): string => JSON.stringify(teams)

export const isTeamsEmpty = (teams: SavedTeamSlot[][]): boolean =>
    teams.every(team => team.every(slot => !slot.main && !slot.support))

const parseTime = (iso: string): number => {
    const t = Date.parse(iso)
    return Number.isFinite(t) ? t : Date.now()
}

export const teamData = (raw: unknown): unknown => asRecord(raw).slots

/** Turns a cloud row into a local team. The local `updatedAt` mirrors the server's so it starts out "clean". */
export function rowToTeam(row: SavedTeamRow, kind: SavedTeamKind): SavedTeam {
    return {
        id: row.list_id,
        name: clampName(row.name),
        slots: sanitizeTeamSlots(teamData(row.data), kind),
        shared: !!row.is_shared,
        createdAt: parseTime(row.created_at),
        updatedAt: parseTime(row.updated_at),
    }
}
