<template>
    <div v-if="character.rarity === 5" class="character-card">
        <div class="image-wrapper" @click="toggleCharacter">
            <img :src="imgSrc" :alt="character.name" class="character-image"
                :class="{ disabled: !character.enabled }" />
            {{ character.name }}
        </div>

        <!-- StatInputs handles all stats -->
        <StatInputs v-if="character.enabled" :member="character" :disabled="!character.enabled" :isSupport=false @update="updateChar" />
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import type { Character } from "../store/characterStore";
import { useCharacterStore } from "../store/characterStore";
import StatInputs from "./StatInputs.vue";

export default defineComponent({
    name: "CharacterCard",
    components: { StatInputs },
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
