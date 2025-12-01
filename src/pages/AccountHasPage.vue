<template>
    <div class="ascension-list">
        <table class="ascension-table">
            <tbody>
                <tr v-for="(chars, index) in groupedByAscension" :key="index">
                    <td class="asc-cell">{{ index === 6 ? "Not Owned" : `A${5 - index}` }}</td>

                    <td class="characters-cell">
                        <div v-for="ch in chars" :key="ch.id" class="character-card">
                            <div class="character-img-wrapper">
                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                    <img class="character-img"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name" />
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character } from "../types/KiokuTypes"

const store = useCharacterStore()
const members = computed(() => store.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica"))

const groupedByAscension = computed(() => {
    const groups: Character[][] = [[], [], [], [], [], [], []]

    for (const ch of members.value) {
        const asc = ch.ascension
        const index = 5 - asc
        if (ch.enabled) {
            if (index >= 0 && index < 6) {
                groups[index].push(ch)
            }
        } else {
            groups[6].push(ch)
        }
    }
    for (const group of groups) {
        group.sort((a, b) => a.id - b.id)
    }

    return groups
})
</script>

<style scoped>
.ascension-list {
    max-width: 900px;
    margin: 0 auto;
    color: #ddd;
}

.ascension-table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid #444;
    padding: 0.5rem;
    vertical-align: top;
}

.asc-cell {
    width: 85px;
    font-weight: bold;
    background-color: #333;
    font-size: 1.2rem;
    color: #eee;
    vertical-align: middle;
    box-sizing: border-box;
}

.characters-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 60px;
}

.character-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid #666;
    display: block;
    transition: transform 0.15s ease;
}

.character-img:hover {
    transform: scale(1.08);
}
</style>