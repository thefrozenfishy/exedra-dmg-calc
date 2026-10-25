<template>
    <div class="team-row-wrapper result-header">
        <div class="header-images-spacer"></div>
        <div class="header-columns">
            <div class="dmg">{{ optimizeAverageDamage ? 'Avg' : 'Max' }} Damage</div>
            <div class="crit">Crit Rate</div>
            <div class="dmg">{{ optimizeAverageDamage ? 'Max' : 'Avg' }} Damage</div>
            <div class="crys">Crystal 1</div>
            <div class="crys">Crystal 2</div>
            <div class="crys">Crystal 3</div>
            <div class="remove-during-export" style="min-width: 200px;"></div>
            <div class="sa-score" :class="{ 'remove-during-export': !showSaScore }">{{ showSaScore ? 'SA Score' : '' }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
defineProps<{ optimizeAverageDamage: boolean, showSaScore?: boolean }>()
</script>

<style scoped>
.team-row-wrapper {
    display: flex;
}

.result-header {
    opacity: 0.6;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0 8px;
    margin-bottom: -0.5rem;
}

.header-images-spacer {
    min-width: calc(5 * (45px + 1.2em));
    flex-shrink: 0;
}

.header-columns {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 4px 8px;
}

.header-columns .dmg {
    text-align: left;
    min-width: 80px;
}

.header-columns .crit {
    text-align: center;
    min-width: 80px;
}

.header-columns .crys {
    flex: 1;
    text-align: right;
    margin-left: 10px;
}

.header-columns .sa-score {
    min-width: 110px;
    text-align: right;
}

.results.exporting .remove-during-export {
    display: none;
}
</style>
