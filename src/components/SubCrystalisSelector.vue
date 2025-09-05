<template>
    <div class="subcrys">
        <select v-for="i in 9" :key="i" :value="modelValue?.[i - 1] ?? ''"
            @change="e => update(i - 1, (e.target as HTMLSelectElement).value)">
            <option disabled value=""></option>
            <option v-for="k in subOptions" :key="k" :value="k">{{ k }}</option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { getSubCrystalises } from "../types/KiokuTypes";

const props = defineProps<{ modelValue?: string[] }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string[]): void }>();

const subOptions = getSubCrystalises();

function update(idx: number, val: string) {
    const newArr = [...(props.modelValue ?? [])];
    newArr[idx] = val;
    emit("update:modelValue", newArr);
}
</script>

<style scoped>
.subcrys {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
}
select {
    width: 90%;
    margin: auto;
}
</style>
