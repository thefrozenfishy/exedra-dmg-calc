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

                <label>
                    Crystalis:
                    <CrystalisSelector v-model="character.crys" :element="character.element" :styleId="character.id" />
                </label>

                <label>
                    Subcrystalis:
                    <SubCrystalisSelector v-model="character.crys_sub" />
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useCharacterStore } from "../store/characterStore";
import StatInputs from "./StatInputs.vue";
import PortraitSelector from './PortraitSelector.vue';
import CrystalisSelector from './CrystalisSelector.vue';
import SubCrystalisSelector from './SubCrystalisSelector.vue';
import { Character } from "../types/KiokuTypes";

export default defineComponent({
    name: "CharacterCard",
    components: {
        StatInputs,
        PortraitSelector,
        CrystalisSelector,
        SubCrystalisSelector
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

        return { imgSrc, toggleCharacter, updateChar };
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
    width: 90px;
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
</style>
