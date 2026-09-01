<template>
  <div class="character-selector">

    <div class="search-row" v-if="!selected">
      <input type="text" v-model="query" placeholder="Search character..." class="search-input" />

      <div v-if="main" class="relevant-toggle">
        <label>
          <input type="checkbox" v-model="onlyRelevant" />
          Show only Kioku with active support ability
        </label>

        <label>
          <input type="checkbox" v-model="onlyFiveStar" />
          Show only 5★ Kioku
        </label>
      </div>
    </div>

    <div v-if="selected" class="selected-character">
      <a :href="`https://exedra.wiki/wiki/${selected.name}`" target="_blank">
        <img :src="`/exedra-dmg-calc/kioku_images/${selected.id}_thumbnail.png`" :alt="selected.name" />
      </a>
      <span>{{ selected.name }}</span>
      <button @click="clear">✖</button>
    </div>

    <div v-else class="character-options">
      <div v-for="char in filteredChars" :key="char.id" class="character-option" @click="select(char)">
        <a :href="`https://exedra.wiki/wiki/${char.name}`" target="_blank">
          <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
        </a>
        <div class="details">
          <p>{{ char.name }}</p>
          <p v-if="main && [main.role, main.element].includes(char.supportTarget)">{{ char.supportDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCharacterStore } from '../store/characterStore'
import { Character } from '../types/KiokuTypes'
import { useSetting } from '../store/settingsStore';
import { LuxMagica } from '../types/enums';

const props = defineProps<{
  selected: Character | undefined
  main?: Character | undefined
  filter?: (c: Character) => boolean
}>()

const emit = defineEmits<{
  (e: 'select', member: typeof props.selected): void
}>()

const store = useCharacterStore()
const characters = store.characters

const query = ref('')
const onlyRelevant = useSetting(() => `${props.main?.id}.onlyRelevant`, true)
const onlyFiveStar = useSetting(() => `${props.main?.id}.onlyFiveStar`, true)

const filteredChars = computed(() => {
  let list = characters

  if (props.filter) {
    list = list.filter(props.filter)
  }

  list = list.filter(c =>
    c.name.toLowerCase().includes(query.value.toLowerCase()) ||
    c.character_en.toLowerCase().includes(query.value.toLowerCase()) ||
    (c.name === "Time Stop Strike" && query.value.toLowerCase().startsWith("moe"))
  )

  if (onlyRelevant.value && props.main) {
    list = list.filter(c =>
      [props.main!.role, props.main!.element].includes(c.supportTarget)
    )
  }

  if (onlyFiveStar.value && props.main) {
    list = list.filter(c => c.rarity === 5 && ![LuxMagica, "Strada Futuro"].includes(c.name))
  }

  return list.sort((a, b) => a.id - b.id)
})

function select(char: Character) {
  emit('select', { ...char })
}

function clear() {
  emit('select', undefined)
}
</script>

<style scoped>
.character-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-row {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  margin-top: 1.1rem;
}

.relevant-toggle {
  position: absolute;
  top: -1.5rem;
  font-size: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.relevant-toggle label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.character-options {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 0.3rem;
}

.character-option p {
  color: var(--text);
}

.character-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.2rem;
}

.character-option img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.selected-character {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.selected-character img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
</style>
