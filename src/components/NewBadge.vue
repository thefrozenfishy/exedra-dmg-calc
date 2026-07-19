<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useSetting } from '../store/settingsStore'

const props = defineProps<{
  id?: string
}>()

const seen = props.id ? useSetting<boolean>(`new_badge_seen:${props.id}`, false) : null
const show = computed(() => !seen || !seen.value)

console.log(props.id, seen?.value, show.value)
if (seen) {
  onUnmounted(() => {
    seen.value = true
  })
}
</script>

<template>
  <span v-if="show" class="new-badge" aria-label="New">✨</span>
</template>

<style scoped>
.new-badge {
  display: inline-block;
  animation: new-badge-pop 1.4s ease-in-out infinite;
  -webkit-text-fill-color: initial;
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
  font-style: normal;
  margin-left: 2px;
}

@keyframes new-badge-pop {

  0%,
  100% {
    transform: scale(1) rotate(-5deg);
  }

  50% {
    transform: scale(1.25) rotate(8deg);
  }
}
</style>
