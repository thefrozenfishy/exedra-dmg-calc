<template>
    <details v-if="groups.length" class="enemy-buffs">
        <summary>
            <span class="summary-title">Enemy buffs</span>
            <span class="summary-sub">{{ s.changedBuffCount ? `${s.changedBuffCount} changed` : 'as in the game' }}</span>
            <button v-if="s.changedBuffCount" type="button" class="reset" @click.prevent="s.resetBuffs()">Reset</button>
        </summary>
        <p class="hint">
            The buffs each enemy gives itself. By default everything is as in the game: <b>Max Damage</b> counts the ones
            it has from the start, and the ones it gains during the fight (e.g. stacks each time it's hit) are at 0
            <template v-if="battles">; the <b>battle simulator</b> plays them as they come</template>. Turn one off to leave
            it out<template v-if="battles"> (in the battle it never lands)</template>, or give it start stacks if your
            team can't avoid feeding it.
            <span class="tag removable">Removable</span> buff removal can take it off;
            <span class="tag fixed">Not removable</span> from a passive (or not a buff), stays.
        </p>
        <div class="groups">
            <div v-for="g in groups" :key="g.app.questEnemyAppearanceMstId" class="group" :class="{ dead: !g.alive }">
                <div class="group-title">{{ g.name }}<span v-if="!g.alive" class="muted"> · not alive</span></div>
                <div v-for="b in g.buffs" :key="b.key" class="buff" :class="{ off: !setting(g, b).on }">
                    <label class="chip" :class="{ active: setting(g, b).on }" :title="setting(g, b).on ? 'Turn off: the enemy never has this buff' : 'Turn back on'">
                        <input type="checkbox" :checked="setting(g, b).on"
                            @change="s.setBuff(g.id, b.key, { on: ($event.target as HTMLInputElement).checked })" />
                        {{ setting(g, b).on ? 'On' : 'Off' }}
                    </label>
                    <div class="buff-main">
                        <div class="buff-name">
                            {{ effectName(b.type) }}<span v-if="valueText(b)" class="value"> {{ valueText(b) }}</span>
                            <span v-if="b.accum" class="muted"> per stack, max {{ b.maxStacks }}</span>
                            <span v-if="b.turn > 0" class="muted"> · {{ b.turn }} turn{{ b.turn > 1 ? 's' : '' }}</span>
                        </div>
                        <div class="buff-meta">
                            <span class="tag" :title="b.sourceDesc">{{ b.passive ? 'Passive' : 'Skill' }} · {{ b.source }}</span>
                            <span class="tag" :class="b.removable ? 'removable' : 'fixed'"
                                :title="b.removable ? 'Given by a skill: buff removal takes it off' : b.passive ? 'Given by a passive: buff removal can\'t take it off' : 'Not a buff that buff removal can take off'">
                                {{ b.removable ? 'Removable' : 'Not removable' }}</span>
                            <span class="muted trigger">{{ b.atEntry ? 'from the start' : b.trigger }}<template v-if="b.conditional"> · only while its condition holds</template></span>
                        </div>
                    </div>
                    <label v-if="!b.atEntry && setting(g, b).on && b.accum" class="stacks"
                        :title="`Stacks the enemy already has when the fight starts (0-${b.maxStacks})`">
                        Start stacks
                        <input class="num" type="number" min="0" :max="b.maxStacks" :value="setting(g, b).stacks"
                            @change="setStacks(g, b, ($event.target as HTMLInputElement).value)" />
                    </label>
                    <label v-else-if="!b.atEntry && setting(g, b).on" class="chip" :class="{ active: setting(g, b).stacks > 0 }"
                        title="The enemy already has this buff when the fight starts">
                        <input type="checkbox" :checked="setting(g, b).stacks > 0"
                            @change="s.setBuff(g.id, b.key, { stacks: ($event.target as HTMLInputElement).checked ? 1 : 0 })" />
                        Active at start
                    </label>
                </div>
            </div>
        </div>
    </details>
</template>

<script setup lang="ts">
// The enemies' own buffs (battle/EngineEnemyBuffs) on the PvE Simulator and the Highest Dmg Calc, under the enemy
// cards, collapsed by default: per buff on / off and start stacks (composables/useStageEnemies enemyBuffs).
import { computed, type UnwrapNestedRefs } from 'vue'
import type { StageEnemies } from '../composables/useStageEnemies'
import { enemyName } from '../models/PvE'
import { effectName, effectValue } from '../utils/effectText'
import type { EnemySelfBuff } from '../battle/EngineEnemyBuffs'

const props = defineProps<{ s: UnwrapNestedRefs<StageEnemies>, battles?: boolean }>()

// one group per distinct enemy on the field (the same appearance twice shares its settings)
const groups = computed(() => {
    const seen = new Set<number>()
    const out: { id: number, app: any, name: string, alive: boolean, buffs: EnemySelfBuff[] }[] = []
    props.s.wave.forEach((a, i) => {
        const id = a.questEnemyAppearanceMstId
        if (seen.has(id)) return
        seen.add(id)
        const buffs = props.s.buffsOf(i)
        if (buffs.length) out.push({ id, app: a, name: enemyName(a), alive: props.s.wave.some((x, j) => x.questEnemyAppearanceMstId === id && props.s.alive[j]), buffs })
    })
    return out
})
const setting = (g: { id: number }, b: EnemySelfBuff) => props.s.buffSetting(g.id, b.key)
const valueText = (b: EnemySelfBuff) => effectValue(b.detail)
function setStacks(g: { id: number }, b: EnemySelfBuff, raw: string) {
    const n = Math.max(0, Math.min(b.maxStacks, Math.trunc(Number(raw) || 0)))
    props.s.setBuff(g.id, b.key, { stacks: n })
}
</script>

<style scoped>
.enemy-buffs {
    margin-top: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.02);
}

summary {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    list-style: revert;
}

.summary-title {
    font-weight: 600;
}

.summary-sub,
.muted {
    color: var(--muted);
    font-size: 0.8rem;
}

.reset {
    margin-left: auto;
    font: inherit;
    font-size: 0.75rem;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
}

.hint {
    font-size: 0.78rem;
    color: var(--muted);
    margin: 0.5rem 0;
    line-height: 1.5;
}

.groups {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.group.dead {
    opacity: 0.55;
}

.group-title {
    font-weight: 600;
    margin-bottom: 0.3rem;
}

.buff {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    flex-wrap: wrap;
}

.buff.off .buff-main {
    opacity: 0.5;
    text-decoration: line-through;
}

.buff-main {
    flex: 1;
    min-width: 200px;
}

.buff-name {
    font-size: 0.85rem;
}

.value {
    font-weight: 600;
}

.buff-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
    margin-top: 0.15rem;
}

.trigger {
    font-size: 0.72rem;
}

.tag {
    font-size: 0.68rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0 0.45rem;
    color: var(--muted);
    white-space: nowrap;
}

.tag.removable {
    color: var(--success);
    border-color: var(--success);
}

.tag.fixed {
    color: var(--danger, #e57373);
    border-color: var(--danger, #e57373);
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.15rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.78rem;
    cursor: pointer;
    color: var(--muted);
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

.stacks {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: var(--muted);
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
</style>
