<template>
    Profile + FriendsKioku SetupCharacter CrystalisMy Kioku ViewerKioku GridAccount Comparison
    Best SA Team CalculatorSingle Battle CalculatorPvP CalculatorPvP 101Gacha Rate+SimLink Raid ToolCrystalis
    RerollerAbout
    <div style="text-align: left;">
        <h1>About</h1>
        This toolbox is various Exedra tools I've found the need for, I try to maintain them all, but if you spot an
        error please don't refrain from poking me on discord @tff in the <a href="https://discord.gg/magiaexedra">Exedra
            Discord</a>.

        <h2>Profile</h2>
        <p>You can store your data online by syncing your data. Note down your recovery code and use it to sync your
            data across devices.</p>

        <h2>Friends</h2>
        <p>You may add other players, allowing you to easily check their owned kioku, as well as calculated total pwr,
            role pwr, and whale pwr, giving a quick way to compare yourself with your friends. Players in the same
            unions are automatically shown in your list.</p>

        <h2>Kioku setup</h2>
        <p><b>Kioku Setup</b> and <b>My Kioku Viewer</b> may be used to edit the Kioku on your account.</p>

        <h2>Calculators</h2>
        <p>The <b>Best SA Team Calculator</b> may be used to find the highest dmg team in any given stage. Find the
            enemy stats on the <a href="https://exedra.wiki/wiki/Magia_Exedra_Wiki">Exedra Wiki</a>. To check futher
            details, such as checking the damage without spesific buffs you can open the team in the <b>Single Battle
                Calculator</b>. The damage calc is based on the <a
                href="https://docs.google.com/spreadsheets/d/1AZhIqAazG_B99bxPWBbsMxKJ_hF24wwiXProgSshsmk/edit?usp=sharing">Exedra
                Damage Calculator Sheet</a> if you wish to input data manually</p>
        <p><b>PvP Calculator</b> is made to calculate spd and turn orders, but do be aware that there are many quicks in
            pvp, not all are captured in the calculator, so trust the first few actions mostly.</p>

        <h1>Debug stuff</h1>
        <button class="export-button" :onclick="downloadLS">Export LocalStorage</button>
        <button class="export-button" :onclick="toggleBeta">Toggle beta</button>
    </div>
</template>

<script lang="ts" setup>
import { toggleBeta } from '../utils/betaSettings';

function downloadLS() {
    const data = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exedra_dmg_calc_debug.json';
    a.click();
}
</script>

<style scoped>
.options-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.export-button {
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.6rem;
    font: 0.9em sans-serif;
    color: rgba(255, 255, 255, 0.87);
}
</style>
