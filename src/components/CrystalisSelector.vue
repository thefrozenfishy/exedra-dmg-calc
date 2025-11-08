<template>
    <div class="selector-list">
        <div v-for="i in 3" :key="i" class="selector">
            <input type="text" :value="modelValue?.[i - 1] || query[i - 1]" @input="query[i - 1] = $event.target.value"
                placeholder="Search crystalis..." @focus="show[i - 1] = true" @blur="() => hide(i - 1)" />

            <button v-if="modelValue?.[i - 1]" @click.prevent="update(i - 1, '')" class="clear-btn">
                ×
            </button>

            <ul v-if="show[i - 1] && filtered(i).length" class="dropdown">
                <li class="details" v-for="c in filtered(i)" :key="c.name" @mousedown.prevent="update(i - 1, c.name)">
                    <p style="margin: 0; font-weight: bold;">{{ c.name }}</p>
                    <p v-for="d in c.descriptions" :key="d" style="margin: 0; font-size: 0.85em; color: #666;">{{ d }}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    getCrystalises,
    getPersonalCrystalisEffects,
} from "../types/KiokuTypes";
import { crystalises } from "../utils/helpers";

const props = defineProps<{
    element?: string;
    styleId?: number;
    modelValue?: string[];
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: string[]): void }>();

const query = ref(["", "", ""]);
const show = ref([false, false, false]);

function filtered(index: number) {
    const q = (query.value[index - 1] || "").toLowerCase();
    const ex = props.styleId ? getPersonalCrystalisEffects(props.styleId) : [];
    return [
        { name: "EX", descriptions: ex },
        ...getCrystalises(props.element)
            .map((c) => crystalises[c])
            .filter(Boolean)
            .map((c) => {
                const eff = find_all_details(true, c.value1, true);
                const desc = Object.values(eff).map(
                    (e) =>
                        `${e.description}${e.turn ? ` (${e.turn} Turn${e.turn === 1 ? "" : "s"})` : ""
                        }`
                );
                return { ...c, descriptions: desc };
            }),
    ].filter(
        (c) =>
            c.name.toLowerCase().includes(q) ||
            c.descriptions.some((d) => d.toLowerCase().includes(q))
    );
}

function update(idx: number, val: string) {
    const newArr = [...(props.modelValue ?? [])];
    newArr[idx] = val;
    emit("update:modelValue", newArr);
    query.value[idx] = val;
    show.value[idx] = false;
}

function hide(idx: number) {
    setTimeout(() => (show.value[idx] = false), 150);
}
</script>
