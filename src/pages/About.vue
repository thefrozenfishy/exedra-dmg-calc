<template>
    <div style="text-align: left;">
        <h1>About</h1>
        <h2>Team Setup</h2>
        <p>Used to input your team. The Kioku here will be used as your available Kioku on other pages</p>
        <h2>Calculate Best Team</h2>
        <p>A Score Attack tool, allowing you to calculate your best team for any stage.</p>
        <p>The best teams usually do not include 4★ Kioku, but you can include them in the calculation if you check the
            boxes</p>
        <p>By default only attackers are tested, but if you want to use a non-Attacker as attacker in the simulator
            simply add them to extra attackers</p>
        <p>Hits to kill is there to reflect a quick in the code, where the amount of enemies are calculated separately
            for each enemy, meaning that Oriko support, Momoko EX etc will do less damage to other enemies if any of the
            former are killed. You can test the effect in Single Team Calculator</p>
        <p>Note that it always assumes the +10% crit dmg and +60 ATK substats are chosen on the crystalises, as these
            are the only ones increasing damage done</p>
        <h2>Simulate Single Battle</h2>
        <p>Here you can set up a concrete battle, and see how minor changes affects the total damage dealt. The settings
            are otherwise identical to the previous pages. Changes done to Kioku here do not overwrite your defaults, so
            feel free to change values as desired</p>
        <h1>Contact</h1>
        <p>If you have feedback, notice any bugs, or have suggestions for improvements just reach out to tff on the <a
                href="https://discord.gg/magiaexedra">exedra discord</a>, or make issues/pr on <a
                href="https://github.com/thefrozenfishy/exedra-dmg-calc">GitHub</a></p>
        <h1>Known Issues</h1>
        <ul>
            <li>Melodia Appassionata (Swimsuit Sayaka) vortex are not added to the calculation</li>
        </ul>
        <h1>Planned improvements</h1>
        <ul>
            <li>Clean up styling</li>
            <li>Store results to speed up later duplicate simulations</li>
            <li>Allow non-healer teams in best team calculator</li>
            <li>Revise dmg taken- (and def-?) calculation</li>
        </ul>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.options-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
