<template>
    <div :class="loading ? 'loading-bar' : 'team-row'">
        <div class="images">
            <div class="image-wrapper">
                <a v-if="team.attacker" :href="`https://exedra.wiki/wiki/${team.attacker.name}`" target="_blank">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team.attacker.id}_thumbnail.png`"
                        :alt="team.attacker.name" :title="team.attacker.name" class="character-image" />
                </a>
                <a v-if="!loading && team.atk_supp" :href="`https://exedra.wiki/wiki/${team.atk_supp.name}`"
                    target="_blank" class="supp-image">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team.atk_supp.id}_thumbnail.png`"
                        :alt="team.atk_supp.name" :title="team.atk_supp.name" />
                </a>
                <a v-if="!loading && team.portrait" :href="`https://exedra.wiki/wiki/${team.portrait}`" target="_blank"
                    class="portrait-image">
                    <img :src="`/exedra-dmg-calc/portraits/${team.portrait}.png`" :alt="team.portrait"
                        :title="team.portrait" />
                </a>
            </div>
            <div v-for="i in 4" :key="i" class="image-wrapper">
                <a v-if="team[`supp${i}`]" :href="`https://exedra.wiki/wiki/${team[`supp${i}`].name}`" target="_blank">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team[`supp${i}`].id}_thumbnail.png`"
                        :title="team[`supp${i}`].name" :alt="team[`supp${i}`].name" class="character-image" />
                </a>
                <a v-if="team[`supp${i}supp`]" :href="`https://exedra.wiki/wiki/${team[`supp${i}supp`].name}`"
                    target="_blank" class="supp-image">
                    <img :src="`/exedra-dmg-calc/kioku_images/${team[`supp${i}supp`].id}_thumbnail.png`"
                        :title="team[`supp${i}supp`].name" :alt="team[`supp${i}supp`].name" />
                </a>
            </div>
        </div>

        <div v-if="!loading" class="results-table">
            <div v-for="(dmg, idx) in team.dmg" :key="idx" class="result-row">
                <div class="dmg"><strong>{{ dmg.toLocaleString() }}</strong></div>
                <div class="crit">Crit rate: {{ team.crit_rate[idx] }}%</div>
                <div class="crys">
                    {{ team.attacker_crys1[idx] }}
                </div>
                <div class="crys">
                    {{ team.attacker_crys2[idx] }}
                </div>
                <div class="crys">
                    {{ team.attacker_crys3[idx] }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { FinalTeam } from '../types/BestTeamTypes';


defineProps<{ team: FinalTeam, loading: boolean }>()
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
    width: 30px;
}

.supp-image {
    margin-top: -20px;
    margin-left: 25px;
}

.portrait-image {
    margin-top: -15px;
    margin-left: -10px;
}

.image-wrapper {
    padding: .3em;
    margin: auto;
}

.team-row {
    display: flex;
    margin-bottom: 1rem;
    width: 80%;
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
</style>
