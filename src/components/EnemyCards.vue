<template>
    <div class="enemy-cards">
        <div class="enemy-grid">
            <div v-for="(e, i) in s.enemyInfo" :key="e.id" class="enemy-card"
                :class="[`pos-${e.position}`, { main: s.mainTargetIdx === i && s.alive[i], dead: !s.alive[i] }]">
                <div class="enemy-top">
                    <img class="enemy-img" :src="enemyImage(e.enemyMstId)" :alt="e.name" @error="hideImg" />
                    <div class="enemy-title">
                        <div class="enemy-name" :title="e.name">{{ e.name }}</div>
                        <div class="enemy-break">
                            <template v-if="e.breakPoint > 0">Break {{ e.breakPoint }} · broken {{ e.initRate }}–{{
                                e.maxRate }}%</template>
                            <template v-else>Can't be broken</template>
                        </div>
                    </div>
                </div>
                <div v-if="e.tag" class="enemy-tag">{{ e.tag }}</div>
                <div class="enemy-stat-grid">
                    <div class="enemy-stat"><span class="enemy-stat-label">HP</span>
                        <span class="enemy-stat-value">{{ fmt(e.hp) }}<span v-if="e.gauges > 1" class="muted"> ×{{
                            e.gauges }}</span></span>
                    </div>
                    <div class="enemy-stat"><span class="enemy-stat-label">ATK</span><span
                            class="enemy-stat-value">{{ fmt(e.atk) }}</span></div>
                    <div class="enemy-stat"><span class="enemy-stat-label">DEF</span><span
                            class="enemy-stat-value">{{ fmt(e.def) }}</span></div>
                    <div class="enemy-stat"><span class="enemy-stat-label">SPD</span><span
                            class="enemy-stat-value">{{ e.spd }}</span></div>
                </div>
                <div v-if="e.weak.length" class="enemy-elements weak" title="Weak to">Weak
                    <img v-for="w in e.weak" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w"
                        :title="w" class="elem-icon" />
                </div>
                <!-- Every resisted element has the same rate, so one number covers them all. -->
                <div v-if="e.resists.length" class="enemy-elements resist" title="Resists">Resist
                    <img v-for="r in e.resists" :key="r.el" :src="`/exedra-dmg-calc/elements/${r.el}.png`"
                        :alt="r.el" :title="r.el" class="elem-icon" />
                    −{{ e.resists[0].pct }}%
                </div>
                <div class="enemy-controls">
                    <label class="chip" :class="{ active: s.alive[i], locked: s.alive[i] && s.aliveCount <= 1 }"
                        :title="!s.alive[i] ? 'Dead: left out of Max Damage entirely (not hit, not targeted, not counted)' : s.aliveCount <= 1 ? 'The last enemy alive can\'t be taken out' : 'Untick to leave this enemy out of Max Damage entirely (not hit, not targeted, not counted)'">
                        <input type="checkbox" :checked="s.alive[i]" :disabled="s.alive[i] && s.aliveCount <= 1"
                            @change="s.setAlive(i, ($event.target as HTMLInputElement).checked)" /> Alive
                    </label>
                    <template v-if="s.alive[i]">
                        <label class="chip" :class="{ active: s.mainTargetIdx === i }"
                            title="Single-target skills hit this enemy">
                            <input type="radio" :checked="s.mainTargetIdx === i" @change="s.setTarget(i)" /> Target
                        </label>
                        <label v-if="e.breakPoint > 0" class="chip" :class="{ active: !!s.broken[i] }"
                            title="Score against this enemy while it's broken">
                            <input type="checkbox" :checked="!!s.broken[i]"
                                @change="s.setBroken(i, ($event.target as HTMLInputElement).checked)" /> Broken
                        </label>
                        <label v-if="e.breakPoint > 0 && s.broken[i]" class="rate-field" title="Broken DMG rate (%)">
                            <input class="num" type="number" min="100" :max="e.maxRate"
                                :value="s.breakRate[i] ?? e.maxRate"
                                @change="s.setBreakRate(i, Number(($event.target as HTMLInputElement).value), e.maxRate)" />%
                        </label>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// The enemy cards of a stage's field (composables/useStageEnemies): alive / target / broken / broken rate per enemy.
// Shared by the PvE Simulator and the Highest Dmg Calc (StageEnemySelector). While 5 columns fit, each enemy sits in
// the column of its position (1-5), above the team on the PvE Simulator.
import type { UnwrapNestedRefs } from 'vue'
import type { StageEnemies } from '../composables/useStageEnemies'

defineProps<{ s: UnwrapNestedRefs<StageEnemies> }>()
const fmt = (n: number) => Math.round(n).toLocaleString()
const hideImg = (ev: Event) => { (ev.target as HTMLImageElement).style.visibility = 'hidden' }
const enemyImage = (enemyMstId: number) => `/exedra-dmg-calc/enemy/${enemyMstId}_thumbnail.png`
</script>

<style scoped>
.enemy-cards {
    container-type: inline-size;
    width: 100%;
}

.enemy-grid {
    display: grid;
    gap: 2rem;
    /* at most 5 columns (a full field), at least 170px each: fewer only when 5 don't fit */
    grid-template-columns: repeat(auto-fill, minmax(max(170px, calc((100% - 4 * 2rem) / 5)), 1fr));
    margin-top: 0.75rem;
}

/* 5 columns of 170px + 4 gaps of 2rem: each enemy in the column of its position */
@container (min-width: 978px) {
    .enemy-card.pos-1 { grid-column: 1; }
    .enemy-card.pos-2 { grid-column: 2; }
    .enemy-card.pos-3 { grid-column: 3; }
    .enemy-card.pos-4 { grid-column: 4; }
    .enemy-card.pos-5 { grid-column: 5; }
}

.muted {
    color: var(--muted);
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.8rem;
    font-family: inherit;
    cursor: pointer;
    color: var(--muted);
    background: transparent;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    user-select: none;
}

.chip input {
    display: none;
}

.chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.chip.locked {
    cursor: not-allowed;
}

.num {
    width: 4.5em;
    padding: 0.15rem 0.3rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font: inherit;
    font-size: 0.78rem;
}

.enemy-tag {
    align-self: flex-start;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    padding: 0 0.5rem;
}

.enemy-card {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    min-width: 0;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.02);
    transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
}

.enemy-card.main {
    border-color: rgba(255, 209, 110, 0.6);
    box-shadow: 0 0 0 1px rgba(255, 209, 110, 0.2);
}

.enemy-card.dead {
    opacity: 0.4;
    filter: grayscale(1);
}

.enemy-top {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    min-width: 0;
}

.enemy-img {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.25);
}

.enemy-title {
    min-width: 0;
}

.enemy-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.enemy-break {
    font-size: 0.75rem;
    color: var(--muted);
}

.enemy-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem 0.5rem;
}

.enemy-stat {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.enemy-stat-label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
}

.enemy-stat-value {
    font-size: 0.82rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.enemy-elements {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
}

.elem-icon {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
}

.weak {
    color: var(--success);
}

.resist {
    color: var(--muted);
}

.enemy-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
}

.rate-field {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--muted);
}
</style>
