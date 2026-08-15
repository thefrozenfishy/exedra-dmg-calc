<template>
    <div class="grid-cell">
        <img :src="imgSrc" :alt="portrait.name" class="grid-thumb" />
        <span class="grid-name">{{ portrait.name }}</span>
        <div class="grid-stats">
            <div v-for="stat in derivedStats" :key="stat.short" class="grid-stat-cell" :title="stat.title">
                <span class="grid-stat-label">{{ stat.short }}</span>
                <span class="grid-stat-value">{{ stat.value ?? '…' }}</span>
            </div>
        </div>
        <p class="grid-description">{{ description }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { Portrait, getPortraitDescription, getPortraitPwr, getPortraitPwrTitle } from '../types/KiokuTypes'

export default defineComponent({
    name: 'PortraitGridCard',
    props: {
        portrait: {
            type: Object as PropType<Portrait>,
            required: true,
        },
        level: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const description = computed(() => getPortraitDescription(props.portrait, props.level))

        const derivedStats = computed(() => [
            { short: 'ATK', value: props.portrait.stats?.[props.level]?.atk },
            { short: 'DEF', value: props.portrait.stats?.[props.level]?.def },
            { short: 'HP', value: props.portrait.stats?.[props.level]?.hp },
            {
                short: 'PWR',
                value: getPortraitPwr(props.portrait, props.level).toLocaleString(),
                title: getPortraitPwrTitle(props.portrait, props.level),
            },
        ])

        const imgSrc = computed(
            () => `/exedra-dmg-calc/portrait_images/${props.portrait.resourceName}_thumbnail.png`
        )

        return {
            description,
            derivedStats,
            imgSrc,
        }
    },
})
</script>

<style scoped>
.grid-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--panel);
    transition: background 0.15s, border-color 0.15s;
}

.grid-cell:hover {
    background: var(--bg-soft);
    border-color: var(--border-strong);
}

.grid-thumb {
    width: 100%;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
}

.grid-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
}

.grid-description {
    font-size: 0.72rem;
    color: var(--muted);
    line-height: 1.35;
    margin: 0;
    white-space: pre-line;
}

.grid-stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    padding: 4px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    width: 100%;
}

.grid-stat-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.grid-stat-cell[title] {
    cursor: help;
}

.grid-stat-label {
    font-size: 0.6rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.grid-stat-value {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text);
}
</style>
