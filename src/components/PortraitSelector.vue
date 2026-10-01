<template>
    <div class="selector">
        <input type="text" :value="modelValue ? (show ? query : modelValue) : query" @input="onInput"
            placeholder="Search portrait or effect…" @focus="onFocus" @blur="hide" />
        <button v-if="modelValue || query" @click.prevent="clear" class="clear-btn" title="Remove portrait">×</button>

        <ul v-if="show && filtered.length" class="dropdown">
            <li v-for="p in filtered" :key="p.name" :class="{ selected: p.name === modelValue }"
                @mousedown.prevent="select(p.name)">
                <img :src="portraitImage(p)" :alt="p.name" />
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
import { KiokuElement } from '../types/enums'
import { getPortraits, getPortraitDescription, Portrait } from "../types/KiokuTypes";
import { portraits } from "../utils/helpers";

const props = defineProps<{
    element?: KiokuElement;
    modelValue?: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const query = ref("");
const show = ref(false);

const filtered = computed(() => {
    const q = query.value.toLowerCase().trim();
    return getPortraits(props.element)
        .map((p) => portraits[p])
        .filter(Boolean)
        .map((p) => ({ ...p, description: getPortraitDescription(p) }))
        .filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
        );
});

function onInput(e: Event) {
    query.value = (e.target as HTMLInputElement).value;
    show.value = true;
}

function onFocus() {
    // Clear the display value so the user sees their query, not the selected name
    query.value = "";
    show.value = true;
}

function select(name: string) {
    query.value = "";
    show.value = false;
    emit("update:modelValue", name);
}

function clear() {
    query.value = "";
    show.value = false;
    emit("update:modelValue", "");
}

function portraitImage(p: Portrait) {
    return `/exedra-dmg-calc/portrait_images/${p.resourceName}_thumbnail.png`;
}

function hide() {
    setTimeout(() => (show.value = false), 150);
}
</script>

<style scoped>
.selector {
    position: relative;
    width: 100%;
}

input {
    width: 100%;
    padding: 5px 26px 5px 8px;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.07);
    color: var(--text);
    font-size: 0.78rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

input:focus {
    border-color: var(--border-strong);
    box-shadow: 0 0 0 3px rgba(246, 212, 133, 0.1);
}

input::placeholder {
    opacity: 0.35;
}

.clear-btn {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--muted);
    opacity: 0.5;
    font-size: 1em;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.clear-btn:hover {
    opacity: 1;
}

.dropdown {
    position: absolute;
    top: calc(100% + 3px);
    left: 0;
    right: 0;
    z-index: 200;
    background: #1e1e2a;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    max-height: 280px;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    min-width: 280px;
}

.dropdown li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    cursor: pointer;
    transition: background 0.1s;
}

.dropdown li.selected {
    background: rgba(246, 214, 130, 0.12);
}

.dropdown li:hover {
    background: rgba(246, 214, 130, 0.08);
}

.dropdown li img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    flex-shrink: 0;
}

.details {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
}

.details p {
    margin: 0;
    line-height: 1.3;
}

.details p:first-child {
    font-size: 0.8em;
    font-weight: 600;
    white-space: normal;
}

.details p:last-child {
    font-size: 0.72em;
    opacity: 0.5;
    white-space: pre-line;
}
</style>
