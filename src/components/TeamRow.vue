<template>
    <div class="team-row">
        <div class="text"><strong>{{ team.dmg.toLocaleString() }}</strong> with {{ team.crit_rate }}% crit rate </div>
        <div class="image-wrapper">
            <img :src="`/exedra-dmg-calc/kioku_images/${team.attacker.id}_thumbnail.png`" :alt="team.attacker.name"
                :title="team.attacker.name" class="character-image" />
            <img :src="`/exedra-dmg-calc/kioku_images/${team.atk_supp.id}_thumbnail.png`" :alt="team.atk_supp.name"
                :title="team.atk_supp.name" class="supp-image" />
            <img :src="`/exedra-dmg-calc/portraits/${team.portrait}.png`" :alt="team.portrait" :title="team.portrait"
                class="portrait-image" />
        </div>
        <div class="image-wrapper">
            <img :src="`/exedra-dmg-calc/kioku_images/${team.sustain.id}_thumbnail.png`" :alt="team.sustain.name"
                :title="team.sustain.name" class="character-image" />
        </div>
        <div v-for="i in 3" class="image-wrapper">
            <img :src="`/exedra-dmg-calc/kioku_images/${team[`supp${i}`].id}_thumbnail.png`"
                :title="team[`supp${i}`].name" :alt="team[`supp${i}`].name" class="character-image" />
            <img v-if="team[`supp${i}supp`]"
                :src="`/exedra-dmg-calc/kioku_images/${team[`supp${i}supp`].id}_thumbnail.png`"
                :title="team[`supp${i}supp`].name" :alt="team[`supp${i}supp`].name" class="supp-image" />
        </div>
        <div class="text">{{ team.attacker_crys1 }} {{ team.attacker_crys2 }} {{ team.attacker_crys3 }} </div>

    </div>
</template>

<script lang="ts" setup>
import { FinalTeam } from '../pages/BestTeamPage.vue';

defineProps<{ team: FinalTeam }>()
</script>

<style scoped>
.character-image {
    width: 45px;
    display: block;
    margin: 0 auto;
}

.supp-image,
.portrait-image {
    width: 30px;
    display: inherit;
    position: absolute;
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
}

.team-row {
    display: flex;
}

.text {
    margin: auto 10px;
}
</style>
