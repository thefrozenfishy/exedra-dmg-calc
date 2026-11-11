<!-- Small padlock toggle pinned to the top-left corner of its (position: relative) parent. Used by CharacterEditor to lock
     a crys, the portrait or the support so the PvE Simulator's "find best attacker loadout" keeps it. -->
<template>
    <button type="button" class="lock-btn" :class="{ active: locked }" :title="locked ? unlockTitle : lockTitle"
        :aria-pressed="locked" @click="emit('toggle')">
        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
            <rect x="4" y="10" width="16" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
            <path v-if="locked" d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            <path v-else d="M7 10V7a5 5 0 0 1 9.3-2.5" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </button>
</template>

<script setup lang="ts">
defineProps<{ locked: boolean, lockTitle: string, unlockTitle: string }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<style scoped>
.lock-btn {
    position: absolute !important;
    top: -0.45rem !important;
    left: -0.45rem !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 2;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 1.3rem !important;
    height: 1.3rem !important;
    min-width: 1.3rem !important;
    max-width: 1.3rem !important;
    min-height: 1.3rem !important;
    max-height: 1.3rem !important;
    padding: 0 !important;
    margin: 0 !important;
    background: var(--panel) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 50% !important;
    color: var(--muted);
    cursor: pointer;
    box-sizing: border-box;
    line-height: 1;
    flex: none;
    transition: background 0.15s, border-color 0.15s, transform 0.1s, color 0.15s;
}

.lock-btn svg {
    display: block;
    width: 11px !important;
    height: 11px !important;
}

.lock-btn:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(255, 209, 110, 0.5) !important;
    transform: scale(1.08);
}

.lock-btn.active {
    background: rgba(255, 209, 110, 0.18) !important;
    border-color: rgba(255, 209, 110, 0.75) !important;
    color: var(--accent);
}
</style>
