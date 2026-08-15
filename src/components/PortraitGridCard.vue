<template>
  <div class="grid-cell">
    <img :src="imgSrc" :alt="portrait.name" class="grid-thumb" />
    <span class="grid-name">{{ portrait.name }}</span>
    <p class="grid-description">{{ description }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { Portrait, getPortraitDescription } from '../types/KiokuTypes'

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

    const imgSrc = computed(
      () => `/exedra-dmg-calc/portrait_images/${props.portrait.resourceName}_thumbnail.png`
    )

    return {
      description,
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
</style>
