<template>
    <div :class="loading ? 'loading-bar' : 'team-row'">
        <div class="images">
            <div class="image-wrapper">
                <a v-if="team.attacker" :href="`https://exedra.wiki/wiki/${team.attacker.name}`" target="_blank">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team.attacker.id}_thumbnail.png`"
                        :alt="team.attacker.name" :title="team.attacker.name" class="character-image" />
                </a>
                <a v-if="!loading && team.atk_supp" :href="`https://exedra.wiki/wiki/${asList(team.atk_supp)[0].name}`"
                    target="_blank" class="supp-image" :class="{ split: asList(team.atk_supp).length > 1 }">
                    <img v-for="(supp, idx) in asList(team.atk_supp)" :key="supp.id"
                        :src="`/exedra-dmg-calc/kioku_images/${supp.id}_thumbnail.png`" :alt="supp.name"
                        :title="asList(team.atk_supp).map(s => s.name).join(' / ')"
                        :style="splitClip(idx, asList(team.atk_supp).length)" />
                    <span v-for="pos in dividerPositions(asList(team.atk_supp).length)" :key="pos" class="split-divider"
                        :style="{ left: pos + '%' }"></span>
                </a>
                <a v-if="!loading && team.portrait" :href="`https://exedra.wiki/wiki/${asList(team.portrait)[0]}`"
                    target="_blank" class="portrait-image" :class="{ split: asList(team.portrait).length > 1 }">
                    <img v-for="(p, idx) in asList(team.portrait)" :key="p"
                        :src="`/exedra-dmg-calc/portrait_images/${portraits[p].resourceName}_thumbnail.png`" :alt="p"
                        :title="asList(team.portrait).join(' / ')"
                        :style="splitClip(idx, asList(team.portrait).length)" />
                    <span v-for="pos in dividerPositions(asList(team.portrait).length)" :key="pos" class="split-divider"
                        :style="{ left: pos + '%' }"></span>
                </a>
                <div v-if="!loading && team.pwr !== undefined" class="combo-pwr">{{ team.pwr.toLocaleString() }}</div>
            </div>
            <div v-for="i in 4" :key="i" class="image-wrapper">
                <a v-if="team[`supp${i}`]" :href="`https://exedra.wiki/wiki/${team[`supp${i}`].name}`" target="_blank">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team[`supp${i}`].id}_thumbnail.png`"
                        :title="team[`supp${i}`].name" :alt="team[`supp${i}`].name" class="character-image" />
                </a>
                <a v-if="team[`supp${i}supp`]"
                    :href="`https://exedra.wiki/wiki/${asList(team[`supp${i}supp`])[0].name}`" target="_blank"
                    class="supp-image" :class="{ split: asList(team[`supp${i}supp`]).length > 1 }">
                    <img v-for="(supp, idx) in asList(team[`supp${i}supp`])" :key="supp.id"
                        :src="`/exedra-dmg-calc/kioku_images/${supp.id}_thumbnail.png`" :alt="supp.name"
                        :title="asList(team[`supp${i}supp`]).map(s => s.name).join(' / ')"
                        :style="splitClip(idx, asList(team[`supp${i}supp`]).length)" />
                    <span v-for="pos in dividerPositions(asList(team[`supp${i}supp`]).length)" :key="pos"
                        class="split-divider" :style="{ left: pos + '%' }"></span>
                </a>
                <a v-if="team[`supp${i}portrait`]"
                    :href="`https://exedra.wiki/wiki/${asList(team[`supp${i}portrait`])[0]}`" target="_blank"
                    class="portrait-image" :class="{ split: asList(team[`supp${i}portrait`]).length > 1 }">
                    <img v-for="(p, idx) in asList(team[`supp${i}portrait`])" :key="p"
                        :src="`/exedra-dmg-calc/portrait_images/${portraits[p].resourceName}_thumbnail.png`" :alt="p"
                        :title="asList(team[`supp${i}portrait`]).join(' / ')"
                        :style="splitClip(idx, asList(team[`supp${i}portrait`]).length)" />
                    <span v-for="pos in dividerPositions(asList(team[`supp${i}portrait`]).length)" :key="pos"
                        class="split-divider" :style="{ left: pos + '%' }"></span>
                </a>
                <div v-if="!loading && team[`supp${i}pwr`] !== undefined" class="combo-pwr">
                    {{ team[`supp${i}pwr`].toLocaleString() }}
                </div>
            </div>
        </div>

        <div v-if="!loading" class="results-table">
            <div v-for="(dmg, idx) in team.optimized_dmg" :key="idx" class="result-row">
                <div class="dmg"><strong>{{ dmg.toLocaleString() }}</strong></div>
                <div class="crit">Crit: {{ team.crit_rate[idx] }}%</div>
                <div class="dmg"><strong>[{{ team.alt_dmg[idx].toLocaleString() }}]</strong></div>
                <div class="crys">
                    {{ presentCrysName(team.attacker_crys1[idx]) }}
                </div>
                <div class="crys">
                    {{ presentCrysName(team.attacker_crys2[idx]) }}
                </div>
                <div class="crys">
                    {{ presentCrysName(team.attacker_crys3[idx]) }}
                </div>
                <div class="remove-during-export">
                    <button @click="saveToStore(idx)" class="save-button">Open team in single battle editor</button>
                </div>
                <div class="remove-during-export">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { FinalTeam } from '../types/BestTeamTypes';
import { crystalises, portraits } from '../utils/helpers';
import { useTeamStore } from '../store/singleTeamStore';
import { maxDmgSubCrys } from '../types/KiokuTypes';
import { KiokuElement } from '../types/enums'
import { useRouter } from 'vue-router'

const presentCrysName = (id: number) => {
    const crys = crystalises[id]
    if (crys.styleMstId) return "EX"
    return crys.name
}

function asList<T>(val: T | T[] | undefined): T[] {
    if (val == null) return []
    return Array.isArray(val) ? val : [val]
}

function splitClip(idx: number, total: number): Record<string, string> {
    if (total <= 1) return {}
    const start = (idx / total) * 100
    const end = ((idx + 1) / total) * 100
    return { clipPath: `inset(0 ${100 - end}% 0 ${start}%)` }
}

function dividerPositions(total: number): number[] {
    if (total <= 1) return []
    return Array.from({ length: total - 1 }, (_, i) => ((i + 1) / total) * 100)
}

function first<T>(val: T | T[] | undefined): T | undefined {
    return Array.isArray(val) ? val[0] : val
}

const props = defineProps<{
    team: FinalTeam,
    weakElements?: { name: KiokuElement, enabled: boolean }[],
    offElementBuffMultReduction?: number,
    offElementDebuffMultReduction?: number
    loading?: boolean,
    optimalSubCrys?: boolean
}>()
const teamStore = useTeamStore()
const router = useRouter()

function saveToStore(idx: number) {
    const { team, weakElements, offElementBuffMultReduction, offElementDebuffMultReduction } = props
    const offElements = weakElements!.filter(w => w.enabled).map(w => w.name)
    teamStore.setMain(0, { ...team.supp1, portrait: first(team.supp1portrait) })
    teamStore.setSupport(0, first(team.supp1supp))
    if (!offElements.includes(team.supp1.element)) {
        teamStore.setCharBuffReduction(0, offElementBuffMultReduction)
        teamStore.setCharDebuffReduction(0, offElementDebuffMultReduction)
    } else {
        teamStore.setCharBuffReduction(0, undefined)
        teamStore.setCharDebuffReduction(0, undefined)
    }

    teamStore.setMain(1, { ...team.supp2, portrait: first(team.supp2portrait) })
    teamStore.setSupport(1, first(team.supp2supp))
    if (!offElements.includes(team.supp2.element)) {
        teamStore.setCharBuffReduction(1, offElementBuffMultReduction)
        teamStore.setCharDebuffReduction(1, offElementDebuffMultReduction)
    } else {
        teamStore.setCharBuffReduction(1, undefined)
        teamStore.setCharDebuffReduction(1, undefined)
    }
    const crysOptions = ({ ...team.attacker.crysOptions })
    Object.values(crysOptions).forEach(c => c.useIndex = 0)
    crysOptions[team.attacker_crys1[idx]] = { ...(crysOptions[team.attacker_crys1[idx]] || {}), useIndex: 1, subCrys: maxDmgSubCrys }
    crysOptions[team.attacker_crys2[idx]] = { ...(crysOptions[team.attacker_crys2[idx]] || {}), useIndex: 2, subCrys: maxDmgSubCrys }
    crysOptions[team.attacker_crys3[idx]] = { ...(crysOptions[team.attacker_crys3[idx]] || {}), useIndex: 3, subCrys: maxDmgSubCrys }
    teamStore.setMain(2, { ...team.attacker, portrait: first(team.portrait), crysOptions })
    teamStore.setSupport(2, first(team.atk_supp))

    teamStore.setMain(3, { ...team.supp3, portrait: first(team.supp3portrait) })
    teamStore.setSupport(3, first(team.supp3supp))
    if (!offElements.includes(team.supp3.element)) {
        teamStore.setCharBuffReduction(3, offElementBuffMultReduction)
        teamStore.setCharDebuffReduction(3, offElementDebuffMultReduction)
    } else {
        teamStore.setCharBuffReduction(3, undefined)
        teamStore.setCharDebuffReduction(3, undefined)
    }

    teamStore.setMain(4, { ...team.supp4, portrait: first(team.supp4portrait) })
    teamStore.setSupport(4, first(team.supp4supp))
    if (!offElements.includes(team.supp4.element)) {
        teamStore.setCharBuffReduction(4, offElementBuffMultReduction)
        teamStore.setCharDebuffReduction(4, offElementDebuffMultReduction)
    } else {
        teamStore.setCharBuffReduction(4, undefined)
        teamStore.setCharDebuffReduction(4, undefined)
    }

    const route = router.resolve('/sa-simulator-single')
    window.open(route.href, '_blank')
}
</script>

<style scoped>
.character-image {
    width: 45px;
    display: block;
    margin: 0 auto;
}

.supp-image,
.portrait-image {
    display: inherit;
    position: absolute;
}

.supp-image img,
.portrait-image img {
    width: 25px;
}

.supp-image {
    margin-top: -20px;
    margin-left: 25px;
}

.portrait-image {
    margin-top: -15px;
    margin-left: -5px;
}

.supp-image.split,
.portrait-image.split {
    width: 25px;
    height: 25px;
}

.supp-image.split img,
.portrait-image.split img {
    position: absolute;
    top: 0;
    left: 0;
}

.split-divider {
    position: absolute;
    top: 0;
    height: 100%;
    width: 1px;
    background: rgba(255, 255, 255, 0.85);
    pointer-events: none;
}

.image-wrapper {
    position: relative;
    padding: .3em;
    margin: auto;
}

.combo-pwr {
    text-align: center;
    font-size: 10px;
    color: var(--muted);
    opacity: 0.75;
    margin-top: 2px;
    white-space: nowrap;
}

.team-row {
    display: flex;
    margin-bottom: 1rem;
    width: 100%;
}

.loading-bar {
    display: flex;
    margin-bottom: 1rem;
    width: 100%;
}

.images {
    display: flex;
}

.text {
    margin: auto 10px;
}

.results-table {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: auto;
    width: 100%;
}

.result-row {
    display: flex;
    justify-content: space-between;
    border-radius: 6px;
    padding: 4px 8px;
    border-bottom: 1px solid #ddd;
}

.result-row:last-child {
    border-bottom: none;
}

.result-row .dmg {
    min-width: 100px;
}

.result-row .crit {
    min-width: 80px;
}

.result-row .crys {
    flex: 1;
    text-align: right;
    margin-left: 10px;
}

.save-button {
    margin-left: auto;
    padding: 0.5em;
    font-size: 12px;
    border: none;
}

.save-button:hover {
    background-color: gray;
}

.results.exporting .remove-during-export {
    display: none;
}
</style>
