<!-- "Find the best loadout for the damage dealer" buttons (anvil): max damage, and (on hover) average damage. The
     same look as the Old Single Hit Calc's; the page runs the search and passes `busy` while it does. -->
<template>
    <span class="attacker-optimizer" :class="{ collapsed: busy }">
        <button type="button" class="optimize-attacker-btn" :disabled="busy || disabled"
            :title="disabled ? disabledTitle : maxTitle" @click="emit('optimize', 'max')">
            <svg viewBox="0 0 24 24" width="18" height="18" class="smith-icon" :class="{ hammering: busy, 'avg-variant': false }" aria-hidden="true">
                <rect class="anvil-part" x="4" y="18.4" width="16" height="1.6" rx="0.5" />
                <polygon class="anvil-part" points="6,18.4 18,18.4 20,14.8 4,14.8" />
                <rect class="anvil-part" x="10.3" y="12.6" width="3.4" height="2.6" />
                <rect class="ingot" x="8.6" y="11" width="6.8" height="1.9" rx="0.35" />
                <g class="spark" stroke="currentColor" stroke-width="0.6" stroke-linecap="round">
                    <line x1="12" y1="9.6" x2="12" y2="7.7" />
                    <line x1="9.3" y1="10.7" x2="7.8" y2="9.6" />
                    <line x1="14.7" y1="10.7" x2="16.2" y2="9.6" />
                </g>
                <g class="hammer-group">
                    <rect class="tool-part" x="14.2" y="1.6" width="1.6" height="10.4" rx="0.7" />
                    <rect class="tool-part" x="10.6" y="0" width="8.4" height="3.4" rx="0.9" />
                </g>
            </svg>
        </button>
        <button type="button" class="optimize-attacker-btn secondary" :disabled="busy || disabled"
            :title="disabled ? disabledTitle : avgTitle" @click="emit('optimize', 'avg')">
            <svg viewBox="0 0 24 24" width="18" height="18" class="smith-icon" :class="{ hammering: busy, 'avg-variant': true }" aria-hidden="true">
                <rect class="anvil-part" x="4" y="18.4" width="16" height="1.6" rx="0.5" />
                <polygon class="anvil-part" points="6,18.4 18,18.4 20,14.8 4,14.8" />
                <rect class="anvil-part" x="10.3" y="12.6" width="3.4" height="2.6" />
                <rect class="ingot" x="8.6" y="11" width="6.8" height="1.9" rx="0.35" />
                <g class="spark" stroke="currentColor" stroke-width="0.6" stroke-linecap="round">
                    <line x1="12" y1="9.6" x2="12" y2="7.7" />
                    <line x1="9.3" y1="10.7" x2="7.8" y2="9.6" />
                    <line x1="14.7" y1="10.7" x2="16.2" y2="9.6" />
                </g>
                <g class="hammer-group">
                    <rect class="tool-part" x="14.2" y="1.6" width="1.6" height="10.4" rx="0.7" />
                    <rect class="tool-part" x="10.6" y="0" width="8.4" height="3.4" rx="0.9" />
                </g>
            </svg>
        </button>
    </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    busy?: boolean
    disabled?: boolean
    maxTitle?: string
    avgTitle?: string
    disabledTitle?: string
}>(), {
    busy: false,
    disabled: false,
    maxTitle: 'Find the best portrait, support & crystalis for this attacker (max dmg)',
    avgTitle: 'Maximize average dmg',
    disabledTitle: 'Not available',
})
const emit = defineEmits<{ optimize: [mode: 'max' | 'avg'] }>()
</script>

<style scoped>
.attacker-optimizer {
    position: relative;
    display: inline-block;
    width: calc(1.6rem * 2 + 0.35rem);
    height: 1.6rem;
    vertical-align: middle;
    margin-left: 0.3rem;
}

.optimize-attacker-btn {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 1.6rem;
    height: 1.6rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.optimize-attacker-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 209, 110, 0.5);
    transform: scale(1.08);
}

.optimize-attacker-btn:disabled {
    opacity: 0.4;
    cursor: default;
}

.optimize-attacker-btn.secondary {
    left: calc(1.6rem + 0.35rem);
    z-index: -1;
    opacity: 0;
    transform: translate(calc(-100% - 0.35rem), 6px) scale(0.65);
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.3s ease, z-index 0s 0.3s;
}

.attacker-optimizer:hover .optimize-attacker-btn.secondary {
    opacity: 1;
    z-index: 1;
    transform: translate(0, 0) scale(1);
    pointer-events: auto;
    transition: opacity 0.25s ease, transform 0.3s ease, z-index 0s;
}

.attacker-optimizer.collapsed .optimize-attacker-btn.secondary {
    opacity: 0 !important;
    z-index: -1 !important;
    transform: translate(calc(-100% - 0.35rem), 6px) scale(0.65) !important;
    pointer-events: none !important;
}

.smith-icon .anvil-part,
.smith-icon .tool-part {
    fill: currentColor;
}

.smith-icon .ingot {
    fill: #d9622b;
}

.smith-icon.avg-variant .ingot {
    fill: #2f6fae;
}

.smith-icon .spark {
    opacity: 0;
}

.smith-icon .hammer-group {
    transform-box: fill-box;
    transform-origin: 52% 96%;
    transform: rotate(-30deg);
    transition: transform 0.2s ease;
}

.smith-icon.hammering .hammer-group {
    animation: smith-strike 0.65s infinite;
}

.smith-icon.hammering .ingot {
    animation: smith-ingot-glow 0.65s infinite;
}

.smith-icon.avg-variant.hammering .ingot {
    animation: smith-ingot-glow-cool 0.65s infinite;
}

.smith-icon.hammering .spark {
    animation: smith-spark 0.65s infinite;
}

@keyframes smith-strike {
    0% {
        transform: rotate(-30deg);
        animation-timing-function: ease-in;
    }

    35% {
        transform: rotate(-30deg);
        animation-timing-function: cubic-bezier(0.6, 0, 1, 1);
    }

    50% {
        transform: rotate(10deg);
        animation-timing-function: ease-out;
    }

    62% {
        transform: rotate(10deg);
    }

    100% {
        transform: rotate(-30deg);
    }
}

@keyframes smith-ingot-glow {

    0%,
    46% {
        fill: #b6501f;
    }

    50% {
        fill: #ffb04d;
    }

    64%,
    100% {
        fill: #d9622b;
    }
}

@keyframes smith-ingot-glow-cool {

    0%,
    46% {
        fill: #1f5686;
    }

    50% {
        fill: #59a8e6;
    }

    64%,
    100% {
        fill: #2f6fae;
    }
}

@keyframes smith-spark {

    0%,
    46% {
        opacity: 0;
    }

    50%,
    56% {
        opacity: 1;
    }

    64%,
    100% {
        opacity: 0;
    }
}
</style>
