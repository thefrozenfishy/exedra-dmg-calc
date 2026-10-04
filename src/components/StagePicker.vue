<template>
    <div class="stage-picker">
        <div class="picker-head">
            <input v-model="query" class="search" type="search" placeholder="Search quests and stages…" />
            <span v-if="selected" class="current" :title="`Stage ${selected.questStageMstId}`">
                {{ path }}
            </span>
        </div>

        <div class="tree">
            <div v-for="cat in filtered" :key="cat.id" class="cat">
                <button type="button" class="node cat-node" @click="toggle('c' + cat.id)">
                    <span class="caret">{{ isOpen('c' + cat.id) ? '▾' : '▸' }}</span>
                    {{ cat.name }} <span class="count">{{ cat.groups.length }}</span>
                </button>
                <div v-if="isOpen('c' + cat.id)" class="groups">
                    <div v-for="g in cat.groups" :key="g.group.questGroupMstId" class="group">
                        <button type="button" class="node group-node" @click="toggle('g' + g.group.questGroupMstId)">
                            <span class="caret">{{ isOpen('g' + g.group.questGroupMstId) ? '▾' : '▸' }}</span>
                            {{ g.group.name }} <span class="count">{{ g.stages.length }}</span>
                        </button>
                        <div v-if="isOpen('g' + g.group.questGroupMstId)" class="stages">
                            <button v-for="st in g.stages" :key="st.questStageMstId" type="button"
                                class="node stage-node" :class="{ active: st.questStageMstId === modelValue }"
                                :title="`Stage ${st.questStageMstId}`"
                                @click="emit('update:modelValue', st.questStageMstId)">
                                {{ stageLabel(st.questStageMstId) }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="!filtered.length" class="empty">No stage matches "{{ query }}".</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// Category -> quest group -> stage navigation over the quest masters (only stages with enemies).
import { computed, reactive, ref, watch } from 'vue'
import { buildStageTree, questStages } from '../models/PvE'
import { stageLabel, stagePath } from '../utils/pveSetup'
import questGroupJson from '../assets/base_data/getQuestGroupMstList.json'

const props = defineProps<{ modelValue?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const tree = buildStageTree()
const groups = new Map<number, any>((questGroupJson as any[]).map(g => [g.questGroupMstId, g]))
const query = ref('')
const open = reactive(new Set<string>())

const isOpen = (k: string) => open.has(k) || query.value.trim().length >= 2
const toggle = (k: string) => { if (open.has(k)) open.delete(k); else open.add(k) }

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (q.length < 2) return tree
    return tree.map(cat => ({
        ...cat,
        groups: cat.groups
            .map(g => g.group.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)
                ? g
                : { ...g, stages: g.stages.filter(s => s.name.toLowerCase().includes(q) || String(s.questStageMstId) === q) })
            .filter(g => g.stages.length),
    })).filter(c => c.groups.length)
})

const selected = computed(() => props.modelValue ? questStages.get(props.modelValue) : undefined)
const path = computed(() => props.modelValue ? stagePath(props.modelValue) : '')

// Open the branch of the current stage.
watch(() => props.modelValue, id => {
    const s = id ? questStages.get(id) : undefined
    const g = s ? groups.get(s.questGroupMstId) : undefined
    if (g) { open.add('c' + g.questCategoryMstId); open.add('g' + g.questGroupMstId) }
}, { immediate: true })
</script>

<style scoped>
.stage-picker {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.picker-head {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.search {
    flex: 1 1 16rem;
    min-width: 0;
    padding: 0.45rem 0.7rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font: inherit;
}

.current {
    color: var(--accent-soft);
    font-size: 0.9rem;
}

.tree {
    max-height: 22rem;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.35rem;
}

.node {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: var(--text);
    font: inherit;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    cursor: pointer;
}

.node:hover {
    background: rgba(255, 255, 255, 0.06);
}

.cat-node {
    font-weight: 600;
}

.groups {
    padding-left: 1rem;
}

.stages {
    padding-left: 1.4rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}

.stage-node {
    font-size: 0.88rem;
    color: var(--muted);
}

.stage-node.active {
    background: rgba(255, 255, 255, 0.12);
    color: var(--accent-soft);
    font-weight: 600;
}

.caret {
    display: inline-block;
    width: 1rem;
    color: var(--muted);
}

.count {
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 400;
}

.empty {
    color: var(--muted);
    padding: 0.5rem;
}
</style>
