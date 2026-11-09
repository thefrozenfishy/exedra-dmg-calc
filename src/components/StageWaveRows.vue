<template>
    <div v-if="s.waves.length" class="wave-row">
        <span class="filters-heading">Wave</span>
        <button v-for="(w, i) in s.waves" :key="i" type="button" class="chip" :class="{ active: s.wavePos === i }"
            @click="s.setWave(i)">{{ i + 1 }} <span class="chip-count">{{ Math.min(w.length, 5) }} enem{{
                Math.min(w.length, 5) === 1 ? 'y' : 'ies' }}<template v-if="w.length > 5"> + {{ w.length - 5 }}
                    backup{{ w.length - 5 === 1 ? '' : 's' }}</template><template v-if="s.waveAddCounts[i]"> + {{
                        s.waveAddCounts[i] }} add{{ s.waveAddCounts[i] === 1 ? '' : 's' }}</template></span></button>
        <span class="row-hint">{{ waveHint }}</span>
        <a v-if="wikiUrl" class="wiki-link" :href="wikiUrl" target="_blank" rel="noopener"
            title="This stage's battle page on exedra.wiki">details →</a>
    </div>
    <div v-if="s.phases.length" class="wave-row">
        <span class="filters-heading">Phase</span>
        <button v-for="f in s.phases" :key="f.step" type="button" class="chip" :class="{ active: s.phasePos === f.step }"
            :title="s.phaseTitle(f)" @click="s.setPhase(f.step)">{{ f.step }} <span class="chip-count">{{
                f.step === 1 ? 'start' : `from ${f.threshold / 10}% HP` }} · ATK {{ fmt(f.appearance.atk) }}</span></button>
        <span class="row-hint">The boss changes form at these HP thresholds. {{ phaseHint }}</span>
    </div>
</template>

<script setup lang="ts">
// The wave / boss phase rows of a stage (composables/useStageEnemies), shared by the PvE Simulator and the
// Highest Dmg Calc (StageEnemySelector).
import type { UnwrapNestedRefs } from 'vue'
import type { StageEnemies } from '../composables/useStageEnemies'

defineProps<{ s: UnwrapNestedRefs<StageEnemies>, waveHint: string, phaseHint: string, wikiUrl?: string }>()
const fmt = (n: number) => Math.round(n).toLocaleString()
</script>

<style scoped>
.wave-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin: 0.9rem 0 0;
}

.wave-row .row-hint {
    margin-left: 0.4rem;
}

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    flex-shrink: 0;
    opacity: 0.8;
}

.row-hint {
    font-size: 0.78rem;
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

.chip-count {
    opacity: 0.7;
    font-size: 0.72rem;
}

.wiki-link {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    white-space: nowrap;
}

.wiki-link:hover {
    text-decoration: underline;
}
</style>
