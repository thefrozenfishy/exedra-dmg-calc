<template>
    <div class="page">
        <h2>Character Crystalis Selections</h2>
        <CharacterSelector :selected="selectedCharacter" @select="onSelectCharacter" :filter="ch => ch.enabled" />

        <div v-if="characterId && character">
            <div class="crys-grid">
                <div v-for="crys in options" :key="crys.selectionAbilityMstId" class="crys-card"
                    :class="{ disabled: !crys.enabled }">

                    <div v-if="crys.enabled" class="use-index-selector">
                        <div v-for="i in 3" :key="i" class="use-index-box" :class="{ active: crys.useIndex === (i) }"
                            @click.stop="setUseIndex(crys.selectionAbilityMstId, i)">
                            {{ i }}
                        </div>
                    </div>

                    <div class="crys-header" @click="toggleCrys(crys.selectionAbilityMstId)">
                        <img :src="`/exedra-dmg-calc/selection_ability/${crys.resourceIconName}.png`" :alt="crys.name"
                            class="crys-image" :class="{ disabled: !crys.enabled }" />

                        <span class="crys-name">{{ crys.name }}</span>
                    </div>

                    <div v-if="crys.enabled" class="subcrys-section">
                        <div v-for="(sub, i) in crys.subCrys" :key="i" class="subcrys-row">
                            <select class="subcrys-select" :value="sub"
                                @change="e => updateSubCrys(crys.selectionAbilityMstId, i, Number((e.target as HTMLSelectElement).value))">
                                <option v-for="item in subCrysList" :key="item.id" :value="item.id">
                                    {{ item.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { relevantCrys, getSubCrystalises } from '../types/KiokuTypes'
import CharacterSelector from '../components/CharacterSelector.vue'
import { useCharacterStore } from '../store/characterStore'
import type { Character } from '../types/KiokuTypes'

const route = useRoute()
const router = useRouter()
const store = useCharacterStore()

const characterId = ref(Number(route.query.character_id) || 0)
const selectedCharacter = ref<Character | undefined>(store.characters.find(c => c.id === characterId.value))

const subCrysList = getSubCrystalises()

const character = computed(() =>
    store.characters.find(c => c.id === characterId.value)
)

const options = computed(() => {
    if (!characterId.value || !character.value) return []
    const crysOptions = character.value.crysOptions

    return relevantCrys(characterId.value).map(c => {
        const selection = crysOptions[c.selectionAbilityMstId]
        return {
            ...c,
            enabled: selection?.enabled ?? false,
            useIndex: selection?.useIndex ?? 0,
            subCrys: selection?.subCrys?.length === 3 ? selection.subCrys : [0, 0, 0],
        }
    }).sort((a, b) => b.rarity - a.rarity || b.sortOrder - a.sortOrder)
})

const toggleCrys = (effectId: number) => {
    const char = character.value
    if (!char) return
    const current = char.crysOptions[effectId]
    store.updateChar({
        ...char,
        crysOptions: {
            ...char.crysOptions,
            [effectId]: {
                ...current,
                enabled: !current?.enabled,
                subCrys: current?.subCrys?.length === 3 ? current.subCrys : [0, 0, 0],
            },
        },
    })
}

const updateSubCrys = (effectId: number, subIndex: number, value: number) => {
    const char = character.value
    if (!char) return
    const current = char.crysOptions[effectId]
    const newSubCrys = [...(current.subCrys?.length === 3 ? current.subCrys : [0, 0, 0])]
    newSubCrys[subIndex] = value
    store.updateChar({
        ...char,
        crysOptions: {
            ...char.crysOptions,
            [effectId]: { ...current, subCrys: newSubCrys },
        },
    })
}

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

const setUseIndex = (effectId: number, useIndex: number) => {
    const char = character.value
    if (!char) return

    for (const crys of Object.values(char.crysOptions)) {
        if (crys.useIndex === useIndex) crys.useIndex = 0
    }
    char.crysOptions[effectId].useIndex = useIndex
}
</script>

<style scoped>
.page {
    padding: 12px;
}

.crys-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 16px;
}

.crys-card {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.15s;
}

.crys-card:not(.disabled) {
    border-color: rgba(255, 255, 255, 0.35);
}

.crys-header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.crys-image {
    width: 64px;
    height: 64px;
    object-fit: contain;
    flex-shrink: 0;
    margin: -5px;
}

.crys-image.disabled {
    opacity: 0.3;
}

.crys-name {
    flex: 1;
    font-size: 0.85em;
    padding-right: 20px;
}

.crys-toggle-hint {
    font-size: 1.1em;
    opacity: 0.6;
}

.subcrys-section {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 4px;
    border-left: 2px solid rgba(255, 255, 255, 0.15);
}

.subcrys-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.subcrys-label {
    font-size: 0.72em;
    opacity: 0.5;
}

.subcrys-select {
    width: 100%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    padding: 3px 6px;
    font-size: 0.85em;
}

.subcrys-select option {
    background: #1e1e2e;
    color: #ffffff;
}

.subcrys-desc {
    font-size: 0.72em;
    opacity: 0.5;
    line-height: 1.3;
}

.crys-card {
    position: relative;
}

.use-index-selector {
    position: absolute;
    top: 8px;
    right: 8px;

    display: flex;
    flex-direction: column;
    gap: 4px;
}

.use-index-box {
    width: 22px;
    height: 14px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 4px;

    font-size: 0.75em;
    cursor: pointer;
    user-select: none;
}

.use-index-box:hover {
    background: rgba(160, 110, 255, 0.28);
}

.use-index-box.active {
    background: rgba(170, 100, 255, 0.7);
    border-color: rgba(220, 180, 255, 0.9);
    font-weight: 600;
}
</style>
