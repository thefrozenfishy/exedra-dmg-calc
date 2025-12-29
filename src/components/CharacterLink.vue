<template>
    <a :href="`https://exedra.wiki/wiki/${name}`" target="_blank" class="character-link">
        <img :src="`/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`" alt="" class="inline-img" />
        <span class="name-text">{{ name }}</span>
        <div class="hover-preview">
            <img :src="`/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`" alt="" />
        </div>
    </a>
</template>

<script setup>
const props = defineProps({
    name: String,
    id: String
})
</script>

<style scoped>
.character-link {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    text-decoration: none;
    color: rgb(219, 173, 196);
    cursor: pointer;
    font-size: inherit;
}

.inline-img {
    height: 1em;
    width: auto;
    border-radius: 50%;
    margin-right: 0.25em;
    flex-shrink: 0;
    vertical-align: bottom;
}



.hover-preview {
    display: none;
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 8em;
    height: 8em;
    border-radius: 0.5em;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 10;
}

.hover-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.character-link:hover .hover-preview {
    display: block;
}
</style>
