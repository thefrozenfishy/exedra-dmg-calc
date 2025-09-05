<template>
  <!-- Main character selector -->
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <!-- Stats -->
  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="validChar(slot?.main)" class="stats">
    <div class="stat">
      Spd: {{ slot.main.spd }}
    </div>
    <div class="stat">
      AV after move: {{ (10000 / slot.main.spd) | 0 }}
    </div>
    <div class="stat">
      Initial AV: {{ slot.main.av }}
    </div>
  </div>

  <!-- Portrait -->
  <div v-if="slot.main" class="stats">
    <div class="selector">
      Portrait:
      <div class="selector-input">
        <input type="text" :value="selectedPortraitName" @input="portraitQuery = $event.target.value"
          placeholder="Search portrait or effect..." @focus="showPortraitDropdown = true"
          @blur="hidePortraitDropdown" />
        <button v-if="props.slot?.main?.portrait" @click.prevent="clearPortrait"
          style="position: absolute; right: 2px; top: 70%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer;">
          ×
        </button>

        <ul v-if="showPortraitDropdown && filteredPortraits.length" class="dropdown">
          <li v-for="portrait in filteredPortraits" :key="portrait.name"
            @mousedown.prevent="selectPortrait(portrait.name)">
            <img :src="portraitImage(portrait)" :alt="portrait.name" />
            <div style="display: flex; flex-direction: column; text-align: left">
              <p style="margin: 0; font-weight: bold;">{{ portrait.name }}</p>
              <p style="margin: 0; font-size: 0.85em; color: #666;">{{ portrait.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div>
      Crystalis:
      <div class="selector" style="display: flex; flex-direction: column;">
        <div v-for="i in 3" :key="i" class="selector-input" style="position: relative; display: inline-block; flex: 1;">
          <input type="text" :value="selectedCrysName(i)" @input="crysQuery[i - 1] = $event.target.value"
            placeholder="Search crystalis..." @focus="showCrysDropdown[i - 1] = true"
            @blur="() => hideCrysDropdown(i)" />

          <!-- Clear button -->
          <button v-if="props.slot?.main?.crys?.[i - 1]" @click.prevent="clearCrys(i)"
            style="position: absolute; right: 2px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer;">
            ×
          </button>

          <!-- Dropdown -->
          <ul v-if="showCrysDropdown[i - 1] && filteredCrys(i, slot.main.id).length" class="dropdown">
            <li v-for="crys in filteredCrys(i, slot.main.id)" :key="crys.name" @mousedown.prevent="selectCrys(i, crys)">
              <div style="display: flex; flex-direction: column; text-align: left;">
                <p style="margin: 0; font-weight: bold;">{{ crys.name }}</p>
                <p v-for="description of crys.descriptions" style="margin: 0; font-size: 0.85em; color: #666;">{{
                  description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <label>
      SubCrystalis:
      <div>
        <select v-for="i in 9" :key="i" :value="slot.main.crys_sub?.[i - 1] ?? ''"
          @change="e => onChangeSubCrys(index, i - 1, e?.target?.value)">
          <option disabled value="">Select a substat</option>
          <option v-for="k in getSubCrystalises()" :key="k" :value="k">
            {{ k }}
          </option>
        </select>
      </div>
    </label>
  </div>

  <!-- Only show support selector if main exists -->
  <div v-if="slot.main" class="support-section">
    <h3>Support</h3>
    <CharacterSelector :selected="slot.support" @select="(member: Character) => setSupport(index, member)" />
  </div>

  <!-- Stats -->
  <div v-if="slot.support" class="stats">
    <StatInputs :member="slot.support" :isSupport="true" @update="setSupport(index, $event)" />
  </div>
</template>

<script setup lang="ts">
import { find_all_details } from '../models/Kioku';
import { TeamSlot } from '../types/BestTeamTypes';
import { getCrystalises, getSubCrystalises, getPortraits, Character, PortraitData, getPersonalCrystalisAbility, getPersonalCrystalisEffects } from '../types/KiokuTypes'
import { crystalises, portraits } from '../utils/helpers'
import CharacterSelector from './CharacterSelector.vue'
import StatInputs from './StatInputs.vue'
import { ref, computed } from "vue";

const validChar = (m?: Character) => {
  return !!m && "av" in m // Check interface has spd in it (PvPCharacter)
}

const props = defineProps<{
  index: number
  slot: TeamSlot
  setMain: (index: number, member: Character) => void
  setSupport: (index: number, member: Character) => void
  onChangeCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
  onChangeSubCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
}>()

const portraitQuery = ref("");
const showPortraitDropdown = ref(false);

const crysQuery = ref(["", "", ""]);
const showCrysDropdown = ref([false, false, false]);

const selectedPortraitName = computed(() =>
  props.slot?.main?.portrait || portraitQuery.value
);

function selectedCrysName(index: number) {
  return props.slot?.main?.crys?.[index - 1] || crysQuery.value[index - 1] || "";
}

const filteredPortraits = computed(() => {
  const q = portraitQuery.value.toLowerCase()
  return getPortraits(props.slot?.main?.element)
    .map(p => portraits[p])
    .filter(Boolean)
    .map(p => {
      const port_eff = find_all_details(true, p.passiveSkill1)
      const best_eff = port_eff[Math.max(...Object.keys(port_eff).map(Number))]
      return { ...p, description: best_eff.description }
    })
    .filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
})

function filteredCrys(index: number, styleId: number) {
  const q = (crysQuery.value[index - 1] || "").toLowerCase();
  const ex = styleId ? getPersonalCrystalisEffects(styleId) : []
  return [{ name: "EX", descriptions: ex }, ...getCrystalises(props.slot?.main?.element)
    .map(c => crystalises[c])
    .filter(Boolean)
    .map(c => {
      const port_eff = find_all_details(true, c.value1, true)
      const descriptions = Object.values(port_eff).map(eff => `${eff.description}${eff.turn ? ` (${eff.turn} Turn${eff.turn === 1 ? "" : "s"})` : ""
        }`).filter(Boolean)
      return { ...c, descriptions }
    })]
    .filter(p => p.name.toLowerCase().includes(q) || p.descriptions.some(c => c.toLowerCase().includes(q)))
}

function selectPortrait(portrait: string) {
  props.setMain(props.index, { ...props.slot.main, portrait } as any);
  portraitQuery.value = portrait; // so input shows selection
  showPortraitDropdown.value = false;
}

function selectCrys(index: number, crys: { name: string; description?: string }) {
  props.onChangeCrys(props.index, index, crys.name);
  crysQuery.value[index - 1] = crys.name;
  showCrysDropdown.value[index - 1] = false;
}

function portraitImage(portrait: PortraitData) {
  return `/exedra-dmg-calc/portrait_images/${portrait?.resourceName}_thumbnail.png`;
}

function hidePortraitDropdown() {
  setTimeout(() => (showPortraitDropdown.value = false), 150);
}

function hideCrysDropdown(index: number) {
  setTimeout(() => (showCrysDropdown.value[index - 1] = false), 150);
}

function clearPortrait() {
  props.setMain(props.index, { ...props.slot.main, portrait: "" } as any);
  portraitQuery.value = "";
}

function clearCrys(index: number) {
  props.onChangeCrys(props.index, index, "");
  crysQuery.value[index - 1] = "";
}
</script>

<style scoped>
.team-page {
  justify-content: center;
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
}

.team-slot {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding-bottom: 1rem;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
}

.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  height: 100%;
}

.stat-inputs label {
  width: 90%;
  display: block;
  margin-left: 0.3rem;
}

.stats select {
  width: 90%;
}

.selector {
  position: relative;
}

.selector input {
  width: 100%;
  padding: 0.4rem;
  max-width: 600px;
}

.selector-input {
  width: 80%;
  margin: 0 auto 0 10px;
}

.dropdown {
  position: absolute;
  z-index: 10;
  border-radius: 4px;
  width: 200%;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.2rem;
  margin-left: -36px;
  background-color: rgba(0, 0, 0, 1)
}

.dropdown li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
}

.dropdown li:hover {
  background: #f0f0f0;
}

.dropdown img {
  width: 100px;
}
</style>
