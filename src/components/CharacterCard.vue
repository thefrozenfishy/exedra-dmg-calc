<template>
    <div v-if="character.rarity !== 3" class="character-card">
        <div class="image-wrapper" @click="toggleCharacter">
            <img :src="imgSrc" :alt="character.name" class="character-image"
                :class="{ disabled: !character.enabled }" />
            {{ character.name }}
        </div>

        <div v-if="character.enabled">
            <StatInputs :member="character" :disabled="!character.enabled" :isSupport=false @update="updateChar" />

            <div v-if="character.enabled" class="stats">
                <label>
                    Portrait:
                    <PortraitSelector v-model="character.portrait" :element="character.element" />
                </label>

                Crystalis:
                <div class="crys-section">
                    <label v-for="slot in 3" :key="slot" class="crys-slot">
                        <select :value="getSelectedCrys(slot)"
                            @change="setCrys(slot, Number(($event.target as HTMLSelectElement).value))">
                            <option :value="0"></option>

                            <option v-for="crys in crysOptions(slot)" :key="crys.selectionAbilityMstId"
                                :value="crys.selectionAbilityMstId">
                                {{ crys.name }}
                            </option>
                        </select>
                    </label>
                </div>
                <router-link class="theme-button" :to="{
                    path: '/character-crys',
                    query: { character_id: character.id }
                }">
                    Edit SubCrys
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useCharacterStore } from "../store/characterStore";
import StatInputs from "./StatInputs.vue";
import PortraitSelector from './PortraitSelector.vue';
import { Character } from "../types/KiokuTypes";
import { crystalises } from "../utils/helpers";

export default defineComponent({
    name: "CharacterCard",
    components: {
        StatInputs,
        PortraitSelector,
    },
    props: {
        character: {
            type: Object as () => Character,
            required: true,
        },
    },
    setup(props) {
        const store = useCharacterStore();

        const imgSrc = computed(
            () => `/exedra-dmg-calc/kioku_images/${props.character.id}_thumbnail.png`
        );

        const toggleCharacter = () => store.toggleCharacter(props.character.id);

        const updateChar = (char: Character) => {
            store.updateChar(char)
        }

        const getSelectedCrys = (slot: number) => {
            const entry = Object.entries(props.character.crysOptions)
                .find(([, c]) => c.useIndex === slot)

            return entry ? Number(entry[0]) : 0
        }

        const crysOptions = (slot: number) => {
            return Object.entries(props.character.crysOptions)
                .filter(([id, crys]) => crys.useIndex === 0 || crys.useIndex === slot)
                .map(([id, crys]) => crystalises[Number(id)])
                .map((crys) => ({
                    ...crys,
                    name: crys.styleMstId ? "EX" : crys.name
                }))
                .sort((a, b) => {
                    const sDiff = b.styleMstId - a.styleMstId
                    if (sDiff) return sDiff
                    return b.sortOrder - a.sortOrder
                })
        }

        const setCrys = (slot: number, newId: number) => {
            Object.values(props.character.crysOptions).forEach(c => {
                if (c.useIndex === slot) {
                    c.useIndex = 0
                }
            })

            if (newId === 0) {
                return
            }

            Object.values(props.character.crysOptions).forEach(c => {
                if (c.useIndex !== slot && c.useIndex !== 0) {
                    const id = Object.entries(props.character.crysOptions)
                        .find(([, v]) => v === c)?.[0]

                    if (Number(id) === newId) {
                        c.useIndex = 0
                    }
                }
            })

            props.character.crysOptions[newId].useIndex = slot
        }

        return {
            imgSrc,
            toggleCharacter,
            updateChar,
            getSelectedCrys,
            crysOptions,
            setCrys,
        };
    },
});
</script>

<style scoped>
.character-card {
    cursor: pointer;
    border: 2px solid transparent;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 110px;
}

.character-image {
    width: 50px;
    display: block;
    margin: 0 auto;
}

.character-image.disabled {
    opacity: 0.3;
}

.image-wrapper {
    height: 130px;
}

.character-card {
    cursor: pointer;
    border: 2px solid transparent;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 110px;

    box-sizing: border-box;
    overflow: hidden;
}

.character-card select {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
}

.crys-slot {
    width: 100%;
}

.crys-section {
    width: 100%;
}

.stats {
    width: 100%;
}

.theme-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    margin-top: 0.4rem;

    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;

    color: var(--text);

    font-size: 0.85rem;
    text-decoration: none;

    box-sizing: border-box;
}

.theme-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.14);
}

.theme-button:active {
    transform: scale(0.98);
}
</style>
