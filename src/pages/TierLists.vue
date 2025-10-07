<script setup>
import { ref } from 'vue'
import TierList from '../components/TierList.vue'

const tabs = ['PvP', "Raid"]
const active = ref(tabs[0])
</script>

<template>
    <div>
        <h1><span style="color:red">UNDER CONSTRUCTION</span></h1>
        <div>
            <button v-for="tab in tabs" :key="tab" @click="active = tab">
                {{ tab }}
            </button>
        </div>

        <transition name="fade" mode="out-in">
            <TierList :key="active" :folder="active" />
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
