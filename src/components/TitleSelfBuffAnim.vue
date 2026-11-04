<script setup lang="ts">
// Header title animation: the icon "buffs itself" (blue glow) while a copy glides up from below
// next to it; the original vanishes and the copy slides left into its spot. Loops forever; the
// end frame equals the start frame, so the reset is invisible.
defineProps<{ src: string }>()
</script>

<template>
    <span class="selfbuff">
        <img :src="src" alt="" class="selfbuff-img selfbuff-a" />
        <img :src="src" alt="" class="selfbuff-img selfbuff-b" />
    </span>
</template>

<style scoped>
.selfbuff {
    --selfbuff-duration: 2.6s;
    position: relative;
    display: inline-block;
    height: 1.1em;
    aspect-ratio: 1;
    vertical-align: middle;
}

.selfbuff-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation-duration: var(--selfbuff-duration);
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    will-change: transform, opacity, filter;
}

.selfbuff-a {
    animation-name: selfbuff-cast;
}

.selfbuff-b {
    animation-name: selfbuff-spawn;
}

/* Original: idle -> blue glow pulse -> disappears once the copy is level with it */
@keyframes selfbuff-cast {
    0%, 12% {
        opacity: 1;
        filter: none;
    }
    22% {
        filter: brightness(1.35) drop-shadow(0 0 0.08em #7cf) drop-shadow(0 0 0.25em #39f);
    }
    34% {
        filter: brightness(1.15) drop-shadow(0 0 0.05em #7cf) drop-shadow(0 0 0.15em #39f);
    }
    44%, 54% {
        opacity: 1;
        filter: none;
    }
    62%, 100% {
        opacity: 0;
        filter: none;
    }
}

/* Copy: appears below-right, glides up level with the original, then slides left into its spot */
@keyframes selfbuff-spawn {
    0%, 18% {
        opacity: 0;
        transform: translate(115%, 70%);
        animation-timing-function: ease-out;
    }
    28% {
        opacity: 1;
    }
    50% {
        opacity: 1;
        transform: translate(115%, 0);
    }
    62% {
        transform: translate(115%, 0);
        animation-timing-function: ease-in-out;
    }
    82%, 100% {
        opacity: 1;
        transform: translate(0, 0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .selfbuff-img {
        animation: none;
    }
    .selfbuff-b {
        display: none;
    }
}
</style>
