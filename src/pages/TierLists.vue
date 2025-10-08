<script setup>
import { ref } from 'vue'
import TierList from '../components/TierList.vue'

const tierListDescriptions = import.meta.glob('../content/tierlists/descriptions/*.md', { eager: true })
const tierLists = Object.entries(tierListDescriptions).map(([path, mod]) => ({
    name: path.split('/').at(-1).replace('.md', ''),
    meta: mod.frontmatter || {},
    Component: mod.default
}))

const tierListChangenotes = import.meta.glob('../content/tierlists/changelogs/*.md', { eager: true })
const changenotes = Object.entries(tierListChangenotes).map(([path, mod]) => ({
    name: path.split('/').at(-1).replace('.md', ''),
    meta: mod.frontmatter || {},
    Component: mod.default
}))

const active = ref(tierLists.map(t => t.name)[0])
</script>

<template>
    <div>
        <h1><span style="color:red">UNDER CONSTRUCTION</span></h1>
        <div>
            <button v-for="tab in tierLists" :key="tab.name" @click="active = tab.name">
                {{ tab.meta.displayname }}
            </button>
        </div>


        <transition name="fade" mode="out-in">
            <div>
                <div v-for="tab in tierLists">
                    <component v-if="tab.name === active" :key="tab.name" :is="tab.Component" />
                    <TierList v-if="tab.name === active" :key="active" :info="tab" />
                </div>
                <div v-for="tab in changenotes">
                    <component v-if="tab.name === active" :key="tab.name" :is="tab.Component" />
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
