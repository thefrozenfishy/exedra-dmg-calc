<template>
    <div class="page">
        <h2>Character Crystalis Selections</h2>
        <CharacterSelector :selected="selectedCharacter" @select="onSelectCharacter" />

        <div v-if="characterId">
            <div v-for="crys in options" :key="crys.name" class="role-section">
                <div class="image-wrapper" @click="toggleCrys">
                    <img :src="`/exedra-dmg-calc/selection_ability/${crys.resourceIconName}.png`" :alt="crys.name"
                        class="character-image" :class="{ disabled: !crys.enabled }" />
                    {{ crys }}
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { relevantCrys, type CrystalisSelection } from '../types/KiokuTypes'
import CharacterSelector from '../components/CharacterSelector.vue'
import { useCharacterStore } from '../store/characterStore'
import type { Character } from '../types/KiokuTypes'

const route = useRoute()
const router = useRouter()
const store = useCharacterStore()

const characterId = ref(Number(route.query.character_id) || 0)
const selectedCharacter = ref<Character | undefined>(store.characters.find(c => c.id === characterId.value))
const selections: ComputedRef<CrystalisSelection[] | undefined> = computed(() =>
    store.characters.find(c => c.id === characterId.value)?.crysOptions
)

const options = computed(() => {
    if (!characterId) return []
    if (selections.value == null) return []
    return relevantCrys(characterId.value).map(c => {
        const chosen = selections.value!.find(s => s.id === c.selectionAbilityMstId)
        return {
            ...c,
            enabled: chosen?.enabled || false,
            subCrys1: chosen?.subCrys1 || 0,
            subCrys2: chosen?.subCrys2 || 0,
            subCrys3: chosen?.subCrys3 || 0,
        }
    }).sort((a, b) => b.rarity - a.rarity || b.sortOrder - a.sortOrder)
})

const onSelectCharacter = async (char?: Character) => {
    if (!char) {
        selectedCharacter.value = undefined
        characterId.value = 0
        await router.replace({ query: {} })
        return
    }

    characterId.value = char.id
    selectedCharacter.value = char
    await router.replace({ query: { character_id: char.id } })
}
</script>

<style scoped>
.page {
    padding: 12px
}

.crys-row {
    display: flex;
    align-items: center;
    margin: 8px 0
}

.crys-col {
    display: flex;
    flex-direction: column;
    align-items: center
}

.crys-image {
    width: 64px;
    height: 64px;
    object-fit: contain
}

.crys-image.disabled {
    opacity: 0.3
}

.subcrys select {
    margin: 4px 0;
    width: 220px
}
</style>
