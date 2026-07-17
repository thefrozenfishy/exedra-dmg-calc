<template>
    <div class="selector">
        <input type="text" :value="modelValue ? (selectedCrys?.name ?? query) : query" @input="onInput"
            :placeholder="placeholder ?? 'Search crys…'" @focus="onFocus" @blur="hide" />
        <button v-if="modelValue || query" @click.prevent="clear" class="clear-btn">×</button>

        <ul v-if="show && filtered.length" class="dropdown">
            <li v-for="crys in filtered" :key="crys.selectionAbilityMstId" @mousedown.prevent="select(crys)">
                <img :src="`/exedra-dmg-calc/selection_ability/${crys.resourceIconName}.png`" :alt="crys.name" />
                <div class="details">
                    <p>{{ crys.name }}</p>
                    <p>{{ crys.description.replaceAll('<br>', ' ') }}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { relevantCrys, type CrystalisData } from '../types/KiokuTypes'
import { crystalises } from '../utils/helpers'

const props = defineProps<{
    characterId: number
    modelValue?: number   // selectionAbilityMstId of currently selected crys, 0 = none
    slot?: number         // if set, only show crys available for this slot
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', id: number): void
    (e: 'select', crys: CrystalisData): void
    (e: 'clear'): void
}>()

const query = ref('')
const show = ref(false)

const allCrys = computed(() =>
    relevantCrys(props.characterId)
        .map(c => ({ ...crystalises[c.selectionAbilityMstId], ...c }))
        .sort((a, b) => (b.styleMstId ?? 0) - (a.styleMstId ?? 0) || b.sortOrder - a.sortOrder)
)

const selectedCrys = computed(() =>
    props.modelValue ? allCrys.value.find(c => c.selectionAbilityMstId === props.modelValue) : undefined
)

const filtered = computed(() => {
    const q = query.value.toLowerCase().trim()
    if (!q) return allCrys.value
    return allCrys.value.filter(
        c =>
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
    )
})

function onInput(e: Event) {
    query.value = (e.target as HTMLInputElement).value
    show.value = true
}

function onFocus() {
    // Clear the display value so user sees their query, not the selected name
    query.value = ''
    show.value = true
}

function select(crys: CrystalisData) {
    query.value = ''
    show.value = false
    emit('update:modelValue', crys.selectionAbilityMstId)
    emit('select', crys)
}

function clear() {
    query.value = ''
    show.value = false
    emit('update:modelValue', 0)
    emit('clear')
}

function hide() {
    setTimeout(() => (show.value = false), 150)
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
    white-space: normal;
}
</style>
