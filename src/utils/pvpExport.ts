// PvP simulator export/import: one JSON file holding the exact team setup, the RNG seed and the
// simulated sequence (human-readable lines + raw snapshots), so a run seen in the browser can be
// replayed exactly elsewhere (scripts/sim/replayExport.ts) and discussed line by line.
import { PvPKioku } from "../models/PvPKioku"
import type { BattleSnapshot, TeamSnapshot } from "../types/KiokuTypes"
import { TargetType } from "../types/KiokuTypes"
import type { TeamSlot } from "../types/BestTeamTypes"

export const PVP_EXPORT_FORMAT = "exedra-pvp-sim"
export const PVP_EXPORT_VERSION = 1

export interface PvPExport {
    format: typeof PVP_EXPORT_FORMAT
    version: number
    exportedAt: string
    engine: string            // simulator branch the file was made with
    seed: number
    turns: number             // turns simulated (each can produce several actions)
    slots: TeamSlot[][]       // usePvPStore().slots as-is: [enemy team, allied team]
    notes?: string
    sequence: string[]        // readable log, one line per row
    snapshots: BattleSnapshot[]
}

// Same construction as PvpTeamPage (allied = slots[1], enemy = slots[0]).
export function buildPvPKiokus(slots: TeamSlot[][]): [PvPKioku[], PvPKioku[]] {
    return [1, 0].map(idx =>
        slots[idx].map((m: any) => {
            const crys = m.main
                ? Object.entries(m.main.crysOptions ?? {}).filter(([, v]: any) => v.useIndex > 0)
                : []
            return new PvPKioku({
                ...m.main,
                crysIDs: crys.map(c => Number(c[0])),
                subCrysIDs: crys.flatMap((c: any) => c[1].subCrys),
                supportKey: m.support ? new PvPKioku(m.support).getKey() : undefined,
            })
        })
    ) as [PvPKioku[], PvPKioku[]]
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
        `MP ${n(u.mp)}/${n(u.maxMp)}`,
        `break ${n(u.breakCurrent)}/${n(u.maxBreakGauge)}${u.isBroken ? ` BROKEN(${u.breakedDamageReceiveRate ?? 100}%)` : ""}`,
        `spd ${u.spd.toFixed(2)}`,
        `AV ${u.secondsLeft.toFixed(2)}`,
        u.maxMagicStacks ? `magic ${u.magicStacks}/${u.maxMagicStacks}` : "",
        u.shields ? `shield x${u.shields}` : "",
        u.stunned ? "STUNNED" : "",
        u.buffs.length ? `buffs[${u.buffs.join("; ")}]` : "",
        u.debuffs.length ? `debuffs[${u.debuffs.join("; ")}]` : "",
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
        for (const e of s.events ?? []) {
            if (e.kind === "heal") lines.push(`  ${e.source ?? "?"} healed ${e.target} +${n(e.amount)}`)
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
        lines.push(`  Allies (SP ${s.allies.sp})`)
        s.allies.team.forEach(u => lines.push(unitLine(u)))
        lines.push(`  Enemies (SP ${s.enemies.sp})`)
        s.enemies.team.forEach(u => lines.push(unitLine(u)))
    })
    return lines
}

export function buildExport(slots: TeamSlot[][], seed: number, turns: number, snapshots: BattleSnapshot[]): PvPExport {
    return {
        format: PVP_EXPORT_FORMAT,
        version: PVP_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        engine: "battle-engine-3.19",
        seed,
        turns,
        notes: "",                                 // free text: what looks wrong
        sequence: formatSequence(snapshots),       // readable log (read this first)
        slots: JSON.parse(JSON.stringify(slots)),  // exact team setup (for import / replay)
        snapshots: JSON.parse(JSON.stringify(snapshots)),
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
