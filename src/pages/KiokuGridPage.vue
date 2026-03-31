<template>
    <div>
        <div>
            <label> <input type="checkbox" v-model="show5stars" /> Include 5-stars </label>
            <label> <input type="checkbox" v-model="show4stars" /> Include 4-stars </label>
            <label> <input type="checkbox" v-model="show3stars" /> Include 3-stars </label>
            <label>
                <input type="checkbox" v-model="showOwnedOnly" />
                Show Owned Only
            </label>
        </div>

        <div class="grid-scroll">
            <table class="er-grid">
                <thead>
                    <tr>
                        <th class="corner-cell"></th>
                        <th v-for="element in Object.values(KiokuElement)" :key="element"
                            class="header-cell element-header">
                            <img :src="`/exedra-dmg-calc/elements/${element}.png`" :alt="element" :title="element"
                                class="header-icon" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="role in Object.values(KiokuRole)" :key="role">
                        <td class="header-cell role-header">
                            <img :src="`/exedra-dmg-calc/roles/${role}.png`" :alt="role" :title="role"
                                class="header-icon" />
                        </td>
                        <td v-for="element in Object.values(KiokuElement)" :key="element" class="grid-cell">
                            <div v-for="r in [5, 4, 3]" :key="r" v-show="shouldShow(r)" class="rarity-band"
                                :class="`rarity-${r}`" :style="{ '--band-rows': bandRows(element, role, r) }">
                                <div v-for="ch in getChars(element, role, r)" :key="ch.id" class="char-thumb">
                                    <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                        <img :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`"
                                            :alt="ch.name" :title="makeTitle(ch)" class="char-img"
                                            :class="borderClass(ch)" />
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, KiokuElement, KiokuRole } from "../types/KiokuTypes"
import { useSetting } from "../store/settingsStore"

const store = useCharacterStore()

const shouldShow = (r: number) => {
    if (r === 5) return show5stars.value
    if (r === 4) return show4stars.value
    if (r === 3) return show3stars.value
    return false
}

const show5stars = useSetting("showGrid5stars", true);
const show4stars = useSetting("showGrid4stars", false);
const show3stars = useSetting("showGrid3stars", false);
const showOwnedOnly = useSetting("showGridOnlyOwned", true);

const allChars = computed(() =>
    showOwnedOnly.value ? store.characters.filter(c => c.enabled) : store.characters
)

const getChars = (element: string, role: string, rarity: number): Character[] =>
    allChars.value.filter(
        c => c.element === element && c.role === role && c.rarity === rarity
    )

const maxCharsPerRarityPerRole = computed(() => {
    const result: Record<string, Record<number, number>> = {}
    for (const role of Object.values(KiokuRole)) {
        result[role] = { 3: 0, 4: 0, 5: 0 }
        for (const element of Object.values(KiokuElement)) {
            for (const r of [3, 4, 5]) {
                const count = getChars(element, role, r).length
                if (count > result[role][r]) result[role][r] = count
            }
        }
    }
    return result
})

const bandRows = (element: string, role: string, rarity: number): number => {
    const maxInRow = maxCharsPerRarityPerRole.value[role]?.[rarity] ?? 0
    return Math.max(1, Math.ceil(maxInRow / 2))
}

const borderClass = (ch: Character): string => {
    if (ch.name === "Lux☆Magica") return "default-border"
    if (ch.obtain && ch.obtain !== "") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"
}
const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === "Lux☆Magica") { }
    else if (ch.obtain && ch.obtain !== "") {
        title += " -  Limited"
    } else if (ch.permaDate == "") {
        title += " -  Not added to permanent yet"
    } else if (new Date(ch.permaDate) > new Date()) {
        title += " -  Added to standard pool on " + new Date(ch.permaDate).toLocaleDateString()
    }
    return title
}
</script>

<style scoped>
.grid-scroll {
    overflow-x: auto;
}

.er-grid {
    border-collapse: collapse;
    min-width: max-content;
    margin: 0 auto;
}

.corner-cell,
.header-cell {
    background: #2c2c2c;
    padding: 0.4rem 0.5rem;
    border: 1px solid #444;
}

.header-icon {
    height: 50px;
    display: block;
    margin: 0 auto;
}

.rarity-band {
    --icon: 64px;
    --gap: 2px;
    --pad: 3px;
    display: grid;
    grid-template-columns: repeat(2, var(--icon));
    padding: var(--pad) 4px;
    min-height: calc(var(--band-rows, 1) * var(--icon) + (var(--band-rows, 1) - 1) * var(--gap) + 2 * var(--pad));
    border-radius: 4px;
    box-sizing: border-box;
}

.rarity-5 {
    background: rgba(255, 215, 0, 0.07);
}

.rarity-4 {
    background: rgba(192, 132, 252, 0.07);
}

.rarity-3 {
    background: rgba(125, 211, 252, 0.07);
}

.char-img {
    height: 60px;
    border-radius: 50%;
    display: block;
}

.char-img:hover {
    transform: scale(1.1);
}

.limited-border {
    border: 2px solid red;
}

.not-limited-border {
    border: 2px solid rgb(255, 255, 0);
}

.default-border {
    border: 2px solid transparent;
}
</style>