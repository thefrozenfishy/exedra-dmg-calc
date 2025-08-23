<template>
  <div class="character-selector">
    <input type="text" v-model="query" placeholder="Search character..." class="search-input" v-if="!selected" />

    <div v-if="selected" class="selected-character">
      <img :src="`/exedra-dmg-calc/kioku_images/${selected.id}_thumbnail.png`" :alt="selected.name" />
      <span>{{ selected.name }}</span>
      <button @click="clear">✖</button>
    </div>

    <div v-else class="character-options">
      <div v-for="char in filteredChars" :key="char.id" class="character-option" @click="select(char)">
        <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
        <span>{{ char.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCharacterStore } from '../store/characterStore'
import type { Character } from '../store/characterStore'

const props = defineProps<{
  selected: Character | undefined
}>()

const emit = defineEmits<{
  (e: 'select', member: typeof props.selected): void
}>()

const store = useCharacterStore()
const characters = store.characters

const query = ref('')

const filteredChars = computed(() => {
  return characters.filter(c =>
    c.name.toLowerCase().includes(query.value.toLowerCase()) || c.character_en.toLowerCase().includes(query.value.toLowerCase())
  ).sort((a, b) => a.id > b.id)
})

function select(char: Character) {
  emit('select', { ...char })
}

function clear() {
  emit('select', null)
}
</script>

<style scoped>
.character-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
