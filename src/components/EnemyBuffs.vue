<template>
    <div v-if="groups.length" class="enemy-buffs">
        <div class="eb-head">
            <button type="button" class="eb-toggle" :aria-expanded="!collapsed" :title="collapsed ? 'Show the enemy buffs' : 'Hide the enemy buffs'"
                @click="collapsed = !collapsed">
                <span class="eb-chevron" :class="{ closed: collapsed }">▾</span>
                <h3 class="eb-title">Enemy buffs</h3>
            </button>
            <span class="eb-count">{{ s.changedBuffCount ? `${s.changedBuffCount} changed` : 'as in the game' }}</span>
            <button v-if="s.changedBuffCount" type="button" class="link-btn" @click="s.resetBuffs()">Reset to the defaults</button>
        </div>
        <template v-if="!collapsed">
        <p class="eb-hint">
            The buffs each enemy gives itself. <b>Max Damage</b> counts the ones it has from the start; the ones it gains
            during the fight (like stacks each time it's hit) are at 0 unless you give it start
            stacks<template v-if="battles">, and the <b>battle simulator</b> plays them as they come</template>.
            Click one to turn it off<template v-if="battles"> (in the battle it never lands)</template>.
            Shared with the {{ battles ? 'Highest Dmg Calc' : 'PvE Simulator' }} for the same enemy.
        </p>
        <div class="eb-grid" :class="{ single: groups.length === 1 }">
            <div v-for="g in groups" :key="g.id" class="eb-col" :class="[`pos-${g.position}`, { dead: !g.alive }]">
                <div class="eb-col-head">
                    <img class="eb-thumb" :src="enemyImage(g.enemyMstId)" :alt="g.name" @error="hideImg" />
                    <span class="eb-enemy" :title="g.name">{{ g.name }}</span>
                </div>
                <div class="eb-cards">
                <div v-for="b in g.buffs" :key="b.key" class="eb-card" :class="{ off: !setting(g, b).on }"
                    :title="`${b.type}\nClick to turn ${setting(g, b).on ? 'off' : 'on'}`"
                    @click="s.setBuff(g.id, b.key, { on: !setting(g, b).on })">
                    <div class="eb-effect">
                        <span class="eb-name">{{ effectName(b.type) }}</span>
                        <span v-if="valueText(b)" class="eb-value">{{ valueText(b) }}</span>
                    </div>
                    <div class="eb-desc">
                        <template v-if="b.accum">Per stack, up to {{ b.maxStacks }}. </template>
                        <template v-if="b.turn > 0">{{ b.turn }} turn{{ b.turn > 1 ? 's' : '' }}. </template>
                        {{ b.atEntry ? 'Has it from the start' : b.passive ? `Gains it at ${b.trigger}${b.triggerConditional ? ' when its conditions are met' : ''}` : 'Gains it when it uses the skill' }}<template v-if="b.conditional">, active only while its condition holds</template>.
                    </div>
                    <div class="eb-meta">
                        <span class="eb-tag" :title="b.sourceDesc">{{ b.passive ? 'Passive' : 'Skill' }}: {{ b.source }}</span>
                        <span class="eb-tag" :class="b.removable ? 'removable' : 'fixed'"
                            :title="b.removable ? 'Given by a skill: buff removal takes it off' : b.passive ? 'Given by a passive: buff removal can\'t take it off' : 'Not a buff that buff removal can take off'">
                            {{ b.removable ? 'Removable' : 'Not removable' }}</span>
                    </div>
                    <div class="eb-foot">
                        <label v-if="!b.atEntry && setting(g, b).on && b.accum" class="eb-stacks" @click.stop
                            :title="`Stacks it already has when the fight starts (0-${b.maxStacks})`">
                            Start stacks
                            <input class="num" type="number" min="0" :max="b.maxStacks" :value="setting(g, b).stacks"
                                @change="setStacks(g, b, ($event.target as HTMLInputElement).value)" />
                            / {{ b.maxStacks }}
                        </label>
                        <label v-else-if="!b.atEntry && setting(g, b).on" class="eb-stacks" @click.stop
                            title="It already has this buff when the fight starts">
                            <input type="checkbox" :checked="setting(g, b).stacks > 0"
                                @change="s.setBuff(g.id, b.key, { stacks: ($event.target as HTMLInputElement).checked ? 1 : 0 })" />
                            Active at start
                        </label>
                        <span class="eb-switch">{{ setting(g, b).on ? 'On' : 'Off' }}</span>
                    </div>
                </div>
                </div>
            </div>
        </div>
        </template>
    </div>
</template>

<script setup lang="ts">
// The enemies' own buffs (battle/EngineEnemyBuffs) on the PvE Simulator and the Highest Dmg Calc, under the enemy
// cards: one column per enemy (in its position's column, like the enemy cards), one card per buff in the style of the
// Buffs & Debuffs cards. Click = on / off; start stacks (composables/useStageEnemies enemyBuffs, shared by both pages).
import { computed, type UnwrapNestedRefs } from 'vue'
import type { StageEnemies } from '../composables/useStageEnemies'
import { enemyName } from '../models/PvE'
import { effectName, effectValue } from '../utils/effectText'
import type { EnemySelfBuff } from '../battle/EngineEnemyBuffs'
import { useSetting } from '../store/settingsStore'

const props = defineProps<{ s: UnwrapNestedRefs<StageEnemies>, battles?: boolean }>()
// expanded by default; the user's collapse / expand is kept (both pages)
const collapsed = useSetting<boolean>('enemyBuffsCollapsed', false)

// one column per distinct enemy on the field (the same appearance twice shares its settings), at its first position
const groups = computed(() => {
    const seen = new Set<number>()
    const out: { id: number, enemyMstId: number, name: string, position?: number, alive: boolean, buffs: EnemySelfBuff[] }[] = []
    props.s.wave.forEach((a, i) => {
        const id = a.questEnemyAppearanceMstId
        if (seen.has(id)) return
        seen.add(id)
        const buffs = props.s.buffsOf(i)
        if (!buffs.length) return
        out.push({
            id, enemyMstId: a.enemyMstId, name: enemyName(a), position: props.s.enemyInfo[i]?.position,
            alive: props.s.wave.some((x, j) => x.questEnemyAppearanceMstId === id && props.s.alive[j]), buffs,
        })
    })
    return out
})
const setting = (g: { id: number }, b: EnemySelfBuff) => props.s.buffSetting(g.id, b.key)
const valueText = (b: EnemySelfBuff) => effectValue(b.detail)
function setStacks(g: { id: number }, b: EnemySelfBuff, raw: string) {
    const n = Math.max(0, Math.min(b.maxStacks, Math.trunc(Number(raw) || 0)))
    props.s.setBuff(g.id, b.key, { stacks: n })
}
const hideImg = (ev: Event) => { (ev.target as HTMLImageElement).style.visibility = 'hidden' }
const enemyImage = (enemyMstId: number) => `/exedra-dmg-calc/enemy/${enemyMstId}_thumbnail.png`
</script>

<style scoped>
.enemy-buffs {
    container-type: inline-size;
    width: 100%;
    margin-top: 1.25rem;
}

.eb-head {
    display: flex;
    justify-content: center;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.4rem 0.75rem;
}

.eb-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
}

.eb-chevron {
    color: var(--accent-soft);
    font-size: 0.9rem;
    transition: transform 0.15s;
}

.eb-chevron.closed {
    transform: rotate(-90deg);
}

.eb-title {
    margin: 0;
    font-size: 1rem;
    color: var(--accent-soft);
}

.eb-count {
    font-size: 0.8rem;
    color: var(--muted);
}

.link-btn {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.8rem;
    color: var(--accent);
    cursor: pointer;
    text-decoration: underline;
}

.eb-hint {
    color: var(--muted);
    font-size: 0.8rem;
    line-height: 1.45;
    text-align: center;
    max-width: 820px;
    margin: 0.35rem auto 0.75rem;
}

/* same columns as the enemy cards (EnemyCards): at most 5, each enemy above its position while 5 fit */
.eb-grid {
    display: grid;
    gap: 1rem 2rem;
    grid-template-columns: repeat(auto-fill, minmax(max(170px, calc((100% - 4 * 2rem) / 5)), 1fr));
    align-items: start;
}

@container (min-width: 978px) {
    .eb-col.pos-1 { grid-column: 1; }
    .eb-col.pos-2 { grid-column: 2; }
    .eb-col.pos-3 { grid-column: 3; }
    .eb-col.pos-4 { grid-column: 4; }
    .eb-col.pos-5 { grid-column: 5; }
}

/* one enemy: the full width, its cards side by side */
.eb-grid.single {
    grid-template-columns: 1fr;
}

.eb-grid.single .eb-col {
    grid-column: 1 / -1;
}

.eb-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.eb-grid.single .eb-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    align-items: stretch;
}

.eb-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
}

.eb-col.dead {
    opacity: 0.45;
    filter: grayscale(1);
}

.eb-col-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
}

.eb-thumb {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.25);
}

.eb-enemy {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-light, var(--text));
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* the Buffs & Debuffs card (PvESimulatorPage .fx-card), in the enemy's colour */
.eb-card {
    --fx: #ffb74d;
    --fx-bg: rgba(200, 120, 20, 0.14);
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0.45rem 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 3px solid var(--fx);
    background: var(--fx-bg);
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, opacity 0.12s;
}

.eb-card:hover {
    filter: brightness(1.15);
}

.eb-card.off {
    --fx: rgba(255, 255, 255, 0.2);
    --fx-bg: rgba(255, 255, 255, 0.02);
    opacity: 0.6;
}

.eb-card.off .eb-name,
.eb-card.off .eb-value {
    text-decoration: line-through;
}

.eb-effect {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
}

.eb-name {
    font-weight: 600;
    color: var(--fx);
}

.eb-value {
    font-weight: 700;
    color: var(--fx);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.eb-desc {
    font-size: 0.74rem;
    color: var(--muted);
    line-height: 1.35;
}

.eb-meta {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
}

.eb-tag {
    font-size: 0.66rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0 0.45rem;
    color: var(--muted);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.eb-tag.removable {
    color: var(--success);
    border-color: var(--success);
}

.eb-tag.fixed {
    color: var(--danger);
    border-color: var(--danger);
}

.eb-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem 0.6rem;
}

.eb-switch {
    margin-left: auto;
    font-size: 0.66rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fx);
    border: 1px solid var(--fx);
    border-radius: 999px;
    padding: 0 0.45rem;
}

.eb-stacks {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    color: var(--muted);
    cursor: default;
}

.num {
    width: 3.6em;
    padding: 0.1rem 0.3rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font: inherit;
    font-size: 0.75rem;
}
</style>
