<template>
    <div class="gallery-page">
        <h1>Kioku stats</h1>
        Data here will be used as defaults in Single Battle Simulator, as well as being the considered Kioku in Best
        Team calculator

        <h2>Export/Import</h2>
        <div>
            <button @click="exportCharacters()">Export</button>
            <label style="margin-left: 30px;">
                Import
                <input  type="file" accept="application/json" @change="handleFileChange" />
            </label>
        </div>

        <h2>Set default values for all Kioku:</h2>
        <div class="default-row" v-for="stat in stats" :key="stat.key">
            <label> {{ stat.label }}:
                <input type="number" :min="stat.min" :max="stat.max"
                    @input="e => setAll(stat.key, e.target.valueAsNumber)" />
            </label>
        </div>

        <h2>Kioku config</h2>
        <div v-for="(chars, role) in groupedCharacters" :key="role" class="role-section">
            <h2>{{ role }}</h2>

            <div class="gallery">
                <CharacterCard v-for="char in chars" :key="char.id" :character="char" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import CharacterCard from '../components/CharacterCard.vue'
import { useCharacterStore } from '../store/characterStore'
import { KiokuConstants } from '../types/KiokuTypes'

export default defineComponent({
    components: { CharacterCard },
    setup() {
        const store = useCharacterStore()

        function handleFileChange(e: Event) {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                store.importCharacters(file).catch(err => alert("Import failed: " + err.message))
            }
        }

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

        const setAll = (key, newVal) => {
            store.setCharacters(store.characters.map(char => {
                char[key] = newVal
                return char;
            }))
        }

        const stats = [
            { key: 'ascension', label: 'Ascension', min: 0, max: KiokuConstants.maxAscension },
            { key: 'kiokuLvl', label: 'Kioku Level', min: 1, max: KiokuConstants.maxKiokuLvl },
            { key: 'magicLvl', label: 'Magic Level', min: 0, max: KiokuConstants.maxMagicLvl },
            { key: 'heartphialLvl', label: 'Heartphial Level', min: 1, max: KiokuConstants.maxHeartphialLvl },
            { key: 'specialLvl', label: 'Special Level', min: 1, max: KiokuConstants.maxSpecialLvl }
        ]


        return { groupedCharacters, setAll, stats, handleFileChange, exportCharacters: store.exportCharacters }
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

.default-row {
    display: contents;
}
</style>
