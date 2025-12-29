<script setup>
const props = defineProps({
    src: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <div class="markdown-page">
        <component :is="props.src" />
    </div>
</template>


<style scoped>
.markdown-page {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 1rem;
    color: #ddd;
    font-family: sans-serif;
    line-height: 1.7;
    text-align: left;
}

.markdown-page :deep(h1),
.markdown-page :deep(h2),
.markdown-page :deep(h3) {
    color: #fff;
    margin-top: 1.5rem;
}

.markdown-page :deep(p) {
    margin: 0.75rem 0;
}

.markdown-page :deep(ul),
.markdown-page :deep(ol) {
    margin-left: 1.5rem;
}

.markdown-page :deep(code) {
    background: #2a2a2a;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
}

.markdown-page :deep(pre) {
    background: #1e1e1e;
    padding: 0.75rem;
    border-radius: 6px;
    overflow-x: auto;
}
</style>
