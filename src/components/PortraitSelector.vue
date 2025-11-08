<template>
    <div class="selector">
        <input type="text" :value="modelValue || query" @input="query = $event.target.value"
            placeholder="Search portrait or effect..." @focus="show = true" @blur="hide" />
        <button v-if="modelValue" @click.prevent="clear" class="clear-btn">
            ×
        </button>

        <ul v-if="show && filtered.length" class="dropdown">
            <li v-for="p in filtered" :key="p.name" @mousedown.prevent="select(p.name)">
                <img :src="portraitImage(p)" />
                <div class="details">
                    <p>{{ p.name }}</p>
                    <p>{{ p.description }}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getPortraits, KiokuElement, Portrait } from "../types/KiokuTypes";
import { portraits } from "../utils/helpers";
import { passiveDetails } from '../utils/helpers';

const props = defineProps<{
    element?: KiokuElement;
    modelValue?: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const query = ref("");
const show = ref(false);

const filtered = computed(() => {
    const q = query.value.toLowerCase();
    return getPortraits(props.element)
        .map((p) => portraits[p])
        .filter(Boolean)
        .map((p) => {
            const eff = Object.values(passiveDetails).filter(v => (v as any).passiveSkillMstId === p.passiveSkill1 * 100 + 6)
            const best = eff[Math.max(...Object.keys(eff).map(Number))];

            if (p.name === "Faith We'll Meet Again Someday")
                best.description = "Increases DMG dealt when targeting elemental weakness by 20%."
            // This for some reason has the wrong description, so we override it manually... z_z

            if (!best.description.includes((best.value1 / 10).toString())) {
                console.error("Description is wrong? ", p, best)
                best.description += ` (ERROR. Root data is wrong value should be ${(best.value1 / 10).toString()}). Tell TFF to fix`
            }
            return { ...p, description: best.description };
        })
        .filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
        );
});

function select(name: string) {
    emit("update:modelValue", name);
    query.value = name;
    show.value = false;
}

function clear() {
    emit("update:modelValue", "");
    query.value = "";
    show.value = false;
}

function portraitImage(p: Portrait) {
    return `/exedra-dmg-calc/portrait_images/${p.resourceName}_thumbnail.png`;
}

function hide() {
    setTimeout(() => (show.value = false), 150);
}
</script>
