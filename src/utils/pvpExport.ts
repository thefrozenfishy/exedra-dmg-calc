import type { RaidCarry } from "../models/PvPBattle";
// PvP simulator export/import: one JSON file holding the exact team setup, the RNG seed and the
// simulated sequence (human-readable lines), so a run seen in the browser can be replayed exactly
// elsewhere (scripts/sim/replayExport.ts) and discussed line by line.
//
// What a replay / import uses: the team builds (`slots`), stage, seed, RNG mode, control mode, turns,
// `decisions` and the Solo Raid state. Everything else (`sequence`, `decisionLog`, `pending`) is a readable
// record of what this engine version did, for reading and for `replayExport.ts --diff`; it is never read back,
// so an old file still imports with the current engine. Files from before 2026-10-07 also carry raw
// `snapshots` (ignored) and every character's full catalog entry (only the build fields are used).
import { PvPKioku } from "../models/PvPKioku"
import type { BattleSnapshot, TeamSnapshot } from "../types/KiokuTypes"
import { TargetType } from "../types/KiokuTypes"
import type { TeamSlot } from "../types/BestTeamTypes"
import type { RngDecision, RngEvent, RngMode } from "../models/BattleRng"

export const PVP_EXPORT_FORMAT = "exedra-pvp-sim"
export const PVP_EXPORT_VERSION = 1

export interface PvPExport {
    format: typeof PVP_EXPORT_FORMAT
    version: number
    exportedAt: string
    engine: string            // simulator branch the file was made with
    seed: number
    rngMode?: RngMode         // default "seed" (files from before the RNG modes)
    decisions?: Record<number, RngDecision> // Manual mode: changed rolls, by roll index
    turns: number             // turns simulated (each can produce several actions)
    decisionLog?: string[]    // readable: every roll changed by hand (Manual RNG), with its action
    slots: TeamSlot[][]       // usePvPStore().slots (build fields, see compactSlot): [enemy team, allied team]
    notes?: string
    sequence: string[]        // readable log, one line per row
    snapshots?: BattleSnapshot[] // files before 2026-10-07 only (ignored)
}

// A slot as exported: the character entries keep their build (and their crystalis entries only when equipped or
// enabled); normalizeCharacter (singleTeamStore) fills the rest back in on import. The engine reads only the build:
// name/id, levels, ascension, dupes, portrait, equipped crystalis (buildSlotKioku) - kit data comes from this build.
function compactCharacter<T>(c: T): T {
    if (!c) return c
    const opts = (c as any).crysOptions as Record<string, { enabled?: boolean, useIndex?: number }> | undefined
    const out: any = JSON.parse(JSON.stringify(c))
    if (opts) out.crysOptions = Object.fromEntries(Object.entries(out.crysOptions).filter(([, v]: any) => v?.enabled || v?.useIndex > 0))
    return out
}
export function compactSlot(s: TeamSlot): TeamSlot {
    return { ...JSON.parse(JSON.stringify(s)), main: compactCharacter(s.main), support: compactCharacter(s.support) }
}

// JSON text of an export: one entry per line for the readable string lists (sequence, decision log), the rest
// compact. (Pretty-printing everything made files ~6x larger.)
export function exportToText(data: object): string {
    const parts = Object.entries(data).filter(([, v]) => v !== undefined).map(([k, v]) => {
        const body = Array.isArray(v) && v.every(x => typeof x === "string")
            ? (v.length ? `[\n    ${v.map(x => JSON.stringify(x)).join(",\n    ")}\n  ]` : "[]")
            : JSON.stringify(v)
        return `  ${JSON.stringify(k)}: ${body}`
    })
    return `{\n${parts.join(",\n")}\n}\n`
}

// After a relaxed-picks run (BattleRng: an import whose decision indices shifted), the picks keyed by the index
// they were actually used at, so later runs match them exactly. Flipped rolls are kept as they are; stored picks
// that were not used are dropped.
export function rekeyPicks(decisions: Map<number, RngDecision>, snapshots: BattleSnapshot[]): Map<number, RngDecision> {
    const out = new Map([...decisions].filter(([, d]) => !d.pick))
    for (const s of snapshots) for (const r of s.rngEvents ?? []) {
        if (r.userPick && typeof r.outcome === "number") out.set(r.index, { kind: r.kind, label: r.label, value: r.outcome, pick: true })
    }
    return out
}

// One team slot (main + support + equipped crystalis) as an engine unit.
export function buildSlotKioku(m: TeamSlot): PvPKioku {
    const crys = m.main
        ? Object.entries((m.main as any).crysOptions ?? {}).filter(([, v]: any) => v.useIndex > 0)
        : []
    return new PvPKioku({
        ...(m.main as any),
        crysIDs: crys.map(c => Number(c[0])),
        subCrysIDs: crys.flatMap((c: any) => c[1].subCrys),
        supportKey: m.support ? new PvPKioku(m.support as any).getKey() : undefined,
    })
}

// Same construction as PvpTeamPage (allied = slots[1], enemy = slots[0]).
export function buildPvPKiokus(slots: TeamSlot[][]): [PvPKioku[], PvPKioku[]] {
    return [1, 0].map(idx => slots[idx].map(buildSlotKioku)) as [PvPKioku[], PvPKioku[]]
}

const SKILL_NAMES: Record<string, string> = {
    [TargetType.attackId]: "Basic Attack",
    [TargetType.skillId]: "Battle Skill",
    [TargetType.specialId]: "Ultimate",
    [TargetType.fuaId]: "Follow-up",
}

const n = (v: number) => Math.round(v).toLocaleString("en-US")

function unitLine(u: TeamSnapshot): string {
    const parts = [
        u.name.padEnd(28),
        u.isDead ? "KO".padEnd(15) : `HP ${n(u.hp)}/${n(u.maxHp)}`.padEnd(15),
        u.barrier > 0 ? `barrier ${n(u.barrier)}` : "",
        u.maxBp ? `BP ${n(u.bp ?? 0)}/${n(u.maxBp)}` : `MP ${n(u.mp)}/${n(u.maxMp)}`,
        `break ${n(u.breakCurrent)}/${n(u.maxBreakGauge)}${u.isBroken ? ` BROKEN(${u.breakedDamageReceiveRate ?? 100}%)` : ""}`,
        `spd ${u.spd.toFixed(2)}`,
        `AV ${u.secondsLeft.toFixed(2)}`,
        u.maxMagicStacks === 1000 ? `charge ${u.magicStacks / 10}%` : u.maxMagicStacks ? `magic ${u.magicStacks}/${u.maxMagicStacks}` : "",
        u.shields ? `shield x${u.shields}` : "",
        u.stunned ? "STUNNED" : "",
        u.buffs.length ? `buffs[${u.buffs.join("; ")}]` : "",
        u.debuffs.length ? `debuffs[${u.debuffs.join("; ")}]` : "",
        u.ailments?.length ? `ailments[${u.ailments.join("; ")}]` : "",
    ]
    return "    " + parts.filter(Boolean).join(" | ")
}

export function formatSequence(snapshots: BattleSnapshot[]): string[] {
    const lines: string[] = []
    snapshots.forEach((s, idx) => {
        if (idx === 0) lines.push("== Initial state ==")
        else {
            const side = s.lastTeamIsTeam1 ? "Ally" : "Enemy"
            lines.push(`== Action ${idx}: ${s.lastActor} (${side}) - ${SKILL_NAMES[s.lastTargetType ?? ""] ?? s.lastTargetType}${s.actionLabel && s.lastTargetType !== TargetType.fuaId ? ` [${s.actionLabel}]` : ""} ==`)
        }
        const raidBits = [
            s.round ? `round ${s.round}` : "",
            s.linkHp ? `${s.linkHp.name || "linked HP"} ${n(s.linkHp.current)}/${n(s.linkHp.max)}` : "",
            s.countdown ? `countdown ${s.countdown.value} (cancel ${n(s.countdown.cancelTotal)}/${n(s.countdown.cancelMax)})` : "",
            s.vanguard ? (s.vanguard.active ? `Vanguard ACTIVE ${n(s.vanguard.gauge)} left, ${s.vanguard.point}/${s.vanguard.activeMaxPoint}` : `Vanguard ${s.vanguard.point}/${s.vanguard.maxPoint}`) : "",
        ].filter(Boolean)
        if (raidBits.length && (s.linkHp || s.countdown || s.vanguard)) lines.push(`  [${raidBits.join(" | ")}]`)
        for (const e of s.events ?? []) {
            if (e.kind === "summon") lines.push(e.formChange ? `  ${e.source ?? "?"} changed form: ${e.target}` : `  ${e.source ?? "?"} summoned ${e.target}`)
            else if (e.kind === "heal") lines.push(`  ${e.source ?? "?"} healed ${e.target} +${n(e.amount)}`)
            else {
                const extra = [
                    e.isCritical ? "crit" : "",
                    e.barrierAbsorbed ? `${n(e.barrierAbsorbed)} into barrier` : "",
                    e.breakDamage ? `break -${e.breakDamage}` : "",
                    e.broke ? "BREAK" : "",
                    e.breakRateUp ? `broken dmg +${e.breakRateUp}%` : "",
                ].filter(Boolean).join(", ")
                lines.push(`  ${e.source ?? "?"} ${e.kind === "dot" ? "DOT on" : "->"} ${e.target} ${n(e.amount)}${extra ? ` (${extra})` : ""}`)
            }
        }
        for (const r of s.rngEvents ?? []) {
            const result = r.options
                ? `${r.options[r.outcome as number]?.label}${r.userPick ? " (picked)" : ` (${r.options[r.outcome as number]?.weight.toFixed(1)}%)`}`
                : `${r.probability?.toFixed(1)}% ${r.outcome ? "hit" : "miss"}`
            lines.push(`  roll #${r.index} ${r.kind}: ${r.label} -> ${result}${r.decided && !r.userPick ? " [changed]" : ""}`)
        }
        lines.push(`  Allies (SP ${s.allies.sp})`)
        s.allies.team.forEach(u => lines.push(unitLine(u)))
        lines.push(`  Enemies (SP ${s.enemies.sp})`)
        s.enemies.team.forEach(u => lines.push(unitLine(u)))
    })
    return lines
}

export function buildExport(slots: TeamSlot[][], seed: number, turns: number, snapshots: BattleSnapshot[], rng?: { mode: RngMode, decisions?: Map<number, RngDecision> }): PvPExport {
    return {
        format: PVP_EXPORT_FORMAT,
        version: PVP_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        engine: "battle-engine-3.19",
        seed,
        rngMode: rng?.mode ?? "seed",
        decisions: rng?.decisions?.size ? Object.fromEntries(rng.decisions) : undefined,
        turns,
        notes: "",                                 // free text: what looks wrong
        decisionLog: formatDecisions(snapshots),   // what was decided by hand
        sequence: formatSequence(snapshots),       // readable log (read this first)
        slots: slots.map(team => team.map(compactSlot)), // exact team setup (for import / replay)
    }
}

export function parseExport(text: string): PvPExport {
    const data = JSON.parse(text)
    if (data?.format !== PVP_EXPORT_FORMAT || !Array.isArray(data.slots) || typeof data.seed !== "number") {
        throw new Error("Not a PvP simulator export file")
    }
    return data as PvPExport
}

export function downloadText(filename: string, text: string, mime = "application/json") {
    const url = URL.createObjectURL(new Blob([text], { type: mime }))
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------------------------------------------------------------------------------------------
// Decisions made by hand, readable: manual-control picks (targets, Battle Skill / Basic Attack,
// ultimates) and rolls changed in Manual RNG mode (with the default they replaced). "Action N" is
// the entry number used by formatSequence. `pending`: the decision the battle is waiting for.
export function formatDecisions(snapshots: BattleSnapshot[], pending?: RngEvent | null): string[] {
    const lines: string[] = []
    snapshots.forEach((s, idx) => {
        const where = idx === 0 ? "Battle start" : `Action ${idx}`
        for (const r of s.rngEvents ?? []) {
            if (!r.userPick && !r.decided) continue
            if (r.options) {
                const chosen = r.options[r.outcome as number]?.label
                lines.push(r.userPick
                    ? `${where}: ${r.label} -> ${chosen}`
                    : `${where}: ${r.label} -> ${chosen} (changed roll #${r.index}, default ${r.options[r.defaultOutcome as number]?.label})`)
            } else {
                lines.push(`${where}: ${r.label} -> ${r.outcome ? "hit" : "miss"} (changed roll #${r.index}, ${r.probability?.toFixed(1)}% chance, default ${r.defaultOutcome ? "hit" : "miss"})`)
            }
        }
    })
    if (pending) lines.push(`WAITING after action ${snapshots.length - 1}: ${pending.label} [${(pending.options ?? []).map(o => o.label).join(" | ")}]`)
    return lines
}

// ---------------------------------------------------------------------------------------------
// PvE simulator export/import (the PvE Simulator page): stage, team, control mode, RNG settings and
// every decision, plus the readable sequence, so a run replays exactly (scripts/sim/replayExport.ts).
export const PVE_EXPORT_FORMAT = "exedra-pve-sim"
export const PVE_EXPORT_VERSION = 1

export interface PvEExport {
    format: typeof PVE_EXPORT_FORMAT
    version: number
    exportedAt: string
    engine: string
    stageId: number
    stageName?: string
    control: "auto" | "manual" // manual: the user plays the allies and picks every target
    rngMode: RngMode
    seed: number
    turns: number
    decisions?: Record<number, RngDecision> // by decision index (manual picks and changed rolls)
    notes?: string
    decisionLog: string[]      // readable: every decision taken, with its action (read this with the sequence)
    pending?: { label: string, options: string[] } // the decision the battle stopped at, if any
    slots: TeamSlot[]          // useTeamStore().slots, build fields (compactSlot; empty slots included)
    sequence: string[]
    snapshots?: BattleSnapshot[] // files before 2026-10-07 only (ignored)
    // Solo Raid: the chosen party buff, round-limit override, and the carried-over state of each earlier attempt
    // (the run is the attempt after the last one).
    soloRaid?: { partyBuffId?: number, noRoundLimit?: boolean, attempts: RaidCarry[] }
}

export function buildPvEExport(args: {
    stageId: number, stageName?: string, control: "auto" | "manual", rngMode: RngMode, seed: number, turns: number,
    decisions: Map<number, RngDecision>, slots: TeamSlot[], snapshots: BattleSnapshot[], pending?: RngEvent | null,
    soloRaid?: PvEExport["soloRaid"],
}): PvEExport {
    return {
        format: PVE_EXPORT_FORMAT,
        version: PVE_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        engine: "battle-engine-3.19",
        stageId: args.stageId,
        stageName: args.stageName,
        control: args.control,
        rngMode: args.rngMode,
        seed: args.seed,
        turns: args.turns,
        decisions: args.decisions.size ? Object.fromEntries(args.decisions) : undefined,
        notes: "",
        decisionLog: formatDecisions(args.snapshots, args.pending),
        pending: args.pending ? { label: args.pending.label, options: (args.pending.options ?? []).map(o => o.label) } : undefined,
        slots: args.slots.map(compactSlot),
        sequence: formatSequence(args.snapshots),
        soloRaid: args.soloRaid ? JSON.parse(JSON.stringify(args.soloRaid)) : undefined,
    }
}

export function parsePvEExport(text: string): PvEExport {
    const data = JSON.parse(text)
    if (data?.format !== PVE_EXPORT_FORMAT || !Array.isArray(data.slots) || typeof data.stageId !== "number" || typeof data.seed !== "number") {
        throw new Error(data?.format === PVP_EXPORT_FORMAT ? "This is a PvP simulator export (use the PvP Simulator page)" : "Not a PvE simulator export file")
    }
    return data as PvEExport
}
