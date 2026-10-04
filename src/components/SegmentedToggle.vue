<template>
    <div class="fight-mode-row">
        <span v-if="label" class="fight-mode-label">{{ label }}</span>
        <div class="fight-mode-toggle" :style="{ '--count': options.length }" role="radiogroup" :aria-label="label">
            <div class="fight-mode-highlight" :style="{ transform: `translateX(${Math.max(0, index) * 100}%)` }"></div>
            <button v-for="opt in options" :key="opt.value" type="button" class="fight-mode-option" role="radio"
                :aria-checked="modelValue === opt.value" :class="{ active: modelValue === opt.value }"
                :title="opt.title" :disabled="disabled" @click="emit('update:modelValue', opt.value)">
                {{ opt.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends string">
// The segmented "pill" toggle used for Fight type on the Kioku grid page, as a reusable component.
import { computed } from 'vue'

const props = defineProps<{
    modelValue: T
    options: readonly { value: T, label: string, title?: string }[]
    label?: string
    disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
const index = computed(() => props.options.findIndex(o => o.value === props.modelValue))
</script>

<style scoped>
.fight-mode-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.fight-mode-label {
    font-size: 0.8rem;
    color: var(--muted);
}

.fight-mode-toggle {
    position: relative;
    display: inline-grid;
    grid-template-columns: repeat(var(--count, 3), minmax(0, 1fr));
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--panel);
}

.fight-mode-highlight {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc((100% - 6px) / var(--count, 3));
    border-radius: 16px;
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    transition: transform 0.2s ease;
    z-index: 0;
}

.fight-mode-option {
    position: relative;
    z-index: 1;
    padding: 0.2rem 0.9rem;
    border: none;
    background: transparent;
    color: var(--muted);
    font-size: 0.8rem;
    font-family: inherit;
    cursor: pointer;
    border-radius: 16px;
    transition: color 0.12s;
    white-space: nowrap;
}

.fight-mode-option.active {
    color: var(--accent);
}

.fight-mode-option:disabled {
    cursor: default;
    opacity: 0.6;
}
</style>
