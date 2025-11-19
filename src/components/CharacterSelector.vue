<template>
  <div class="character-selector">

    <div class="search-row" v-if="!selected">
      <input type="text" v-model="query" placeholder="Search character..." class="search-input" />

      <label class="relevant-toggle" v-if="main">
        <input type="checkbox" v-model="onlyRelevant" />
        Show only Kioku with active support ability
      </label>
    </div>

    <div v-if="selected" class="selected-character">
      <a :href="`https://exedra.wiki/wiki/${selected.name}`" target="_blank">
        <img :src="`/exedra-dmg-calc/kioku_images/${selected.id}_thumbnail.png`" :alt="selected.name" />
      </a>
      <span>{{ selected.name }}</span>
      <button @click="clear">✖</button>
    </div>

    <div v-else class="character-options">
      <div v-for="char in filteredChars" :key="char.id" class="character-option"
        @click="select(char)">
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

const props = defineProps<{
  selected: Character | undefined
  main?: Character | undefined
}>()

const emit = defineEmits<{
  (e: 'select', member: typeof props.selected): void
}>()

const store = useCharacterStore()
const characters = store.characters

const query = ref('')
const onlyRelevant = ref(true)

const filteredChars = computed(() => {
  let list = characters.filter(c =>
    c.name.toLowerCase().includes(query.value.toLowerCase()) ||
    c.character_en.toLowerCase().includes(query.value.toLowerCase()) ||
    (c.name === "Time Stop Strike" && query.value.toLowerCase().startsWith("moe"))
  )

  if (onlyRelevant.value && props.main) {
    list = list.filter(c =>
      [props.main.role, props.main.element].includes(c.supportTarget)
    )
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
}

.relevant-toggle {
  position: absolute;
  top: -1.5rem;
  font-size: 0.5rem;
  display: flex;
  align-items: center;
}

.character-options {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.3rem;
}

.character-option p {
  color: white;
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
