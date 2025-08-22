<template>
    <div class="gallery-page">
        <h1>Kioku stats</h1>
        Data here will be used as defaults in Single Battle Simulator, as well as being the considered Kioku in Best Team calculator

        <!-- One section per role -->
        <div v-for="(chars, role) in groupedCharacters" :key="role" class="role-section">
            <h2>{{ role }}</h2>

            <div class="gallery">
                <CharacterCard v-for="char in chars" :key="char.id" :character="char" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import CharacterCard from '../components/CharacterCard.vue'
import { useCharacterStore } from '../store/characterStore'

export default defineComponent({
    components: { CharacterCard },
    setup() {
        const store = useCharacterStore()

        // Group characters by role, sort by element then id
        const groupedCharacters = computed(() => {
            const groups: Record<string, typeof store.characters> = {}
            store.characters.forEach(char => {
                if (!groups[char.role]) groups[char.role] = []
                groups[char.role].push(char)
            })

            for (const role in groups) {
                groups[role] = groups[role].slice().sort((a, b) => {
                    if (a.element !== b.element) return a.element === b.element
                    return a.id === b.id
                })
            }
            return groups
        })

        return { groupedCharacters }
    }
})
</script>

<style scoped>
.role-section {
    margin-bottom: 2rem;
}

.role-section h2 {
    margin-bottom: 1rem;
    text-align: left;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    /* max 5 per row */
    gap: 1rem;
}

.gallery-page {
    justify-content: center;
}
</style>
