<template>
    <div v-if="modelValue" class="crys-import-overlay" @click.self="onCancel">
        <div class="crys-import-modal">
            <div class="crys-import-header">
                <h2 class="crys-import-title">Review Import</h2>
                <button class="close-btn" title="Cancel" @click="onCancel">✖</button>
            </div>
            <div v-if="versionWarning" class="version-warning-banner">
                ⚠️ {{ versionWarning.message }}.
                <a :href="versionWarning.url" target="_blank" rel="noopener noreferrer">
                    Get it on GitHub
                </a>
            </div>

            <div class="crys-import-toolbar">
                <span class="import-summary">{{ selectedCount }} / {{ totalCount }} changes selected</span>
                <div class="toolbar-right">
                    <button class="btn btn-sm" @click="toggleAll(true)">Select All</button>
                    <button class="btn btn-sm" @click="toggleAll(false)">Deselect All</button>
                </div>
            </div>

            <div class="crys-import-body">
                <div v-if="!diffCharacters.length" class="empty-state">
                    No differences found between your saved data and this file.
                </div>

                <div v-for="entry in diffCharacters" :key="entry.char.id" class="char-diff-section">
                    <label class="char-diff-header">
                        <input type="checkbox" class="char-diff-checkbox" :checked="charSelectionState(entry) === 'all'"
                            :ref="(el) => setIndeterminate(el, charSelectionState(entry) === 'some')"
                            @change="toggleCharacter(entry)" />
                        <img :src="`/exedra-dmg-calc/kioku_images/${entry.char.id}_thumbnail.png`"
                            :alt="entry.char.name" class="char-diff-icon" />
                        <span class="char-diff-name">{{ entry.char.name }}</span>
                        <span v-if="entry.char.character_en" class="char-diff-name-en">
                            {{ entry.char.character_en }}
                        </span>
                        <span class="char-diff-count">
                            {{getEntryKeys(entry).filter(k => selectedKeys.has(k)).length}} / {{
                                getEntryKeys(entry).length }}
                        </span>
                    </label>

                    <div v-if="entry.equipOrderUnmatched.length" class="equip-order-warning">
                        ⚠ equipOrder names not recognized for this character: {{ entry.equipOrderUnmatched.join(", ") }}
                    </div>

                    <label v-if="!entry.char.enabled" class="diff-item"
                        :class="{ excluded: !selectedKeys.has(`${entry.char.id}-enabled`) }">
                        <input type="checkbox" class="diff-checkbox"
                            :checked="selectedKeys.has(`${entry.char.id}-enabled`)"
                            @change="toggleItem(`${entry.char.id}-enabled`)" />
                        <div class="diff-content">
                            <div class="diff-crys-name">Owned</div>
                            <div class="diff-row">
                                <span class="diff-label">Owned</span>
                                <span class="diff-value diff-old">Disabled</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">Enabled</span>
                            </div>
                        </div>
                    </label>

                    <label v-if="entry.kiokuLvl !== undefined && entry.kiokuLvl !== entry.char.kiokuLvl"
                        class="diff-item" :class="{ excluded: !selectedKeys.has(`${entry.char.id}-kiokuLvl`) }">
                        <input type="checkbox" class="diff-checkbox"
                            :checked="selectedKeys.has(`${entry.char.id}-kiokuLvl`)"
                            @change="toggleItem(`${entry.char.id}-kiokuLvl`)" />
                        <div class="diff-content">
                            <div class="diff-crys-name">Kioku Level</div>
                            <div class="diff-row">
                                <span class="diff-label">Kioku Level</span>
                                <span class="diff-value diff-old">Lvl {{ entry.char.kiokuLvl }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">Lvl {{ entry.kiokuLvl }}</span>
                            </div>
                        </div>
                    </label>

                    <label v-if="entry.magicLvl !== undefined && entry.magicLvl !== entry.char.magicLvl"
                        class="diff-item" :class="{ excluded: !selectedKeys.has(`${entry.char.id}-magicLvl`) }">
                        <input type="checkbox" class="diff-checkbox"
                            :checked="selectedKeys.has(`${entry.char.id}-magicLvl`)"
                            @change="toggleItem(`${entry.char.id}-magicLvl`)" />
                        <div class="diff-content">
                            <div class="diff-crys-name">Magic Level</div>
                            <div class="diff-row">
                                <span class="diff-label">Magic Level</span>
                                <span class="diff-value diff-old">Lvl {{ entry.char.magicLvl }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">Lvl {{ entry.magicLvl }}</span>
                            </div>
                        </div>
                    </label>

                    <label v-if="entry.specialLvl !== undefined && entry.specialLvl !== entry.char.specialLvl"
                        class="diff-item" :class="{ excluded: !selectedKeys.has(`${entry.char.id}-specialLvl`) }">
                        <input type="checkbox" class="diff-checkbox"
                            :checked="selectedKeys.has(`${entry.char.id}-specialLvl`)"
                            @change="toggleItem(`${entry.char.id}-specialLvl`)" />
                        <div class="diff-content">
                            <div class="diff-crys-name">Special Level</div>
                            <div class="diff-row">
                                <span class="diff-label">Special Level</span>
                                <span class="diff-value diff-old">Lvl {{ entry.char.specialLvl }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">Lvl {{ entry.specialLvl }}</span>
                            </div>
                        </div>
                    </label>

                    <label v-if="entry.ascension !== undefined && entry.ascension !== entry.char.ascension"
                        class="diff-item" :class="{ excluded: !selectedKeys.has(`${entry.char.id}-ascension`) }">
                        <input type="checkbox" class="diff-checkbox"
                            :checked="selectedKeys.has(`${entry.char.id}-ascension`)"
                            @change="toggleItem(`${entry.char.id}-ascension`)" />
                        <div class="diff-content">
                            <div class="diff-crys-name">Ascension</div>
                            <div class="diff-row">
                                <span class="diff-label">Ascension</span>
                                <span class="diff-value diff-old">A{{ entry.char.ascension }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">A{{ entry.ascension }}</span>
                            </div>
                        </div>
                    </label>

                    <label v-for="item in entry.items" :key="item.key" class="diff-item" :class="{
                        excluded: !selectedKeys.has(item.key),
                        'row-disabling': item.oldEnabled && !item.newEnabled,
                        'row-enabling': !item.oldEnabled && item.newEnabled
                    }">
                        <input type="checkbox" class="diff-checkbox" :checked="selectedKeys.has(item.key)"
                            @change="toggleItem(item.key)" />

                        <div class="diff-content">
                            <div class="diff-crys-name">{{ item.crysName }}</div>

                            <div class="diff-row" v-if="item.oldEnabled !== item.newEnabled">
                                <span class="diff-label">Status</span>
                                <span class="diff-value" :class="item.oldEnabled ? 'state-enabled' : 'state-disabled'">
                                    {{ item.oldEnabled ? 'Enabled' : 'Disabled' }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value" :class="item.newEnabled ? 'state-enabled' : 'state-disabled'">
                                    {{ item.newEnabled ? 'Enabled' : 'Disabled' }}</span>
                            </div>

                            <div class="diff-row" v-if="item.oldUseIndex !== item.newUseIndex">
                                <span class="diff-label">Equip Slot</span>
                                <span class="diff-value diff-old">
                                    {{ item.oldUseIndex ? `Slot ${item.oldUseIndex}` : 'Unequipped' }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">
                                    {{ item.newUseIndex ? `Slot ${item.newUseIndex}` : 'Unequipped' }}</span>
                            </div>

                            <div class="diff-row" v-for="(slot, idx) in item.subSlots.filter(s => s.changed)"
                                :key="idx">
                                <span class="diff-label">Sub-crys</span>
                                <span class="diff-value diff-old">{{ slot.oldLabel }}</span>
                                <span class="diff-arrow">→</span>
                                <span class="diff-value diff-new">{{ slot.newLabel }}</span>
                            </div>

                            <div v-if="item.unmatched.length" class="diff-warning">
                                ⚠ Couldn't match: {{ item.unmatched.join(", ") }} — left unset
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div class="crys-import-footer">
                <button class="btn" @click="onCancel">Cancel</button>
                <button class="btn btn-primary" :disabled="!selectedCount" @click="onApply">
                    Apply {{ selectedCount }} change{{ selectedCount === 1 ? '' : 's' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CrysDiffCharacter } from '../utils/crysImport'

const props = defineProps<{
    modelValue: boolean
    diffCharacters: CrysDiffCharacter[],
    versionWarning?: { message: string; url: string } | null,
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'apply', selectedKeys: Set<string>): void
    (e: 'cancel'): void
}>()

const selectedKeys = ref<Set<string>>(new Set())

function getEntryKeys(entry: CrysDiffCharacter): string[] {
    const keys = entry.items.map(i => i.key)
    if (entry.kiokuLvl !== undefined && !isNaN(entry.kiokuLvl) && entry.kiokuLvl !== entry.char.kiokuLvl) {
        keys.push(`${entry.char.id}-kiokuLvl`)
    }
    if (entry.magicLvl !== undefined && !isNaN(entry.magicLvl) && entry.magicLvl !== entry.char.magicLvl) {
        keys.push(`${entry.char.id}-magicLvl`)
    }
    if (entry.specialLvl !== undefined && !isNaN(entry.specialLvl) && entry.specialLvl !== entry.char.specialLvl) {
        keys.push(`${entry.char.id}-specialLvl`)
    }
    if (entry.ascension !== undefined && !isNaN(entry.ascension) && entry.ascension !== entry.char.ascension) {
        keys.push(`${entry.char.id}-ascension`)
    }
    if (!entry.char.enabled) {
        keys.push(`${entry.char.id}-enabled`)
    }
    return keys
}

// Default: everything selected, reset whenever a fresh diff comes in.
watch(() => props.diffCharacters, (list) => {
    const all = new Set<string>()
    for (const entry of list) {
        for (const key of getEntryKeys(entry)) all.add(key)
    }
    selectedKeys.value = all
}, { immediate: true })

const totalCount = computed(() => props.diffCharacters.reduce((sum, e) => sum + getEntryKeys(e).length, 0))
const selectedCount = computed(() => selectedKeys.value.size)

function toggleItem(key: string) {
    const next = new Set(selectedKeys.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selectedKeys.value = next
}

function charSelectionState(entry: CrysDiffCharacter): 'all' | 'none' | 'some' {
    const keys = getEntryKeys(entry)
    const selected = keys.filter(k => selectedKeys.value.has(k)).length
    if (selected === 0) return 'none'
    if (selected === keys.length) return 'all'
    return 'some'
}

function setIndeterminate(el: Element | null, indeterminate: boolean) {
    if (el instanceof HTMLInputElement) el.indeterminate = indeterminate
}

function toggleCharacter(entry: CrysDiffCharacter) {
    const selectAll = charSelectionState(entry) !== 'all'
    const next = new Set(selectedKeys.value)
    for (const key of getEntryKeys(entry)) {
        if (selectAll) next.add(key)
        else next.delete(key)
    }
    selectedKeys.value = next
}

function toggleAll(on: boolean) {
    if (!on) {
        selectedKeys.value = new Set()
        return
    }
    const all = new Set<string>()
    for (const entry of props.diffCharacters) {
        for (const key of getEntryKeys(entry)) all.add(key)
    }
    selectedKeys.value = all
}

function onCancel() {
    emit('update:modelValue', false)
    emit('cancel')
}

function onApply() {
    emit('apply', new Set(selectedKeys.value))
    emit('update:modelValue', false)
}
</script>

<style scoped>
.crys-import-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
}

.crys-import-modal {
    width: 100%;
    max-width: 640px;
    max-height: 85vh;
    background: var(--panel);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.crys-import-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.1rem 0.6rem;
    border-bottom: 1px solid var(--border);
}

.crys-import-title {
    margin: 0;
    font-size: 1.15rem;
    color: var(--text);
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: none;
    color: var(--muted);
    font-size: 0.7rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.close-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(255, 255, 255, 0.05);
}

.crys-import-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.55rem 1.1rem;
    border-bottom: 1px solid var(--border);
}

.import-summary {
    font-size: 0.78rem;
    color: var(--muted);
}

.toolbar-right {
    display: flex;
    gap: 0.4rem;
}

.btn {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.4em 0.9em;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: var(--border-strong);
}

.btn:disabled {
    opacity: 0.4;
    cursor: default;
}

.btn-sm {
    padding: 0.28rem 0.65rem;
    font-size: 0.78rem;
}

.btn-primary {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.btn-primary:not(:disabled):hover {
    background: var(--accent-glow);
    filter: brightness(1.15);
}

.crys-import-body {
    overflow-y: auto;
    padding: 0.7rem 1.1rem 1rem;
    flex: 1;
}

.empty-state {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--muted);
    opacity: 0.7;
    font-size: 0.9rem;
}

.char-diff-section {
    margin-bottom: 0.9rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.char-diff-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    background: var(--bg-soft, rgba(255, 255, 255, 0.03));
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    user-select: none;
}

.char-diff-checkbox {
    flex-shrink: 0;
    cursor: pointer;
}

.char-diff-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 50%;
    flex-shrink: 0;
}

.char-diff-name {
    font-weight: 600;
    color: var(--text);
    font-size: 0.88rem;
}

.char-diff-name-en {
    color: var(--muted);
    font-size: 0.78rem;
}

.char-diff-count {
    margin-left: auto;
    font-size: 0.7rem;
    color: var(--muted);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.05rem 0.4rem;
    white-space: nowrap;
}

.diff-item {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.5rem 0.7rem 0.5rem calc(0.7rem - 3px);
    border-bottom: 1px solid var(--border);
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s, border-color 0.15s;
}

.diff-item:last-child {
    border-bottom: none;
}

.diff-item.row-disabling {
    background: rgba(224, 106, 106, 0.12);
    border-left-color: var(--danger, #e06a6a);
}

.diff-item.row-enabling {
    background: rgba(106, 224, 116, 0.12);
    border-left-color: var(--success, #79d5aa);
}

.diff-item.excluded {
    opacity: 0.45;
}

.diff-checkbox {
    margin-top: 0.25rem;
    flex-shrink: 0;
    cursor: pointer;
}

.diff-content {
    flex: 1;
    min-width: 0;
}

.diff-crys-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.15rem;
}

.diff-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: var(--muted);
    flex-wrap: wrap;
}

.diff-label {
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    opacity: 0.7;
    width: 62px;
    flex-shrink: 0;
}

.diff-value {
    padding: 0.05rem 0.4rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
}

.diff-old {
    color: var(--danger, #e06a6a);
}

.diff-new {
    color: var(--accent, #6ae0a0);
}

.state-enabled {
    color: #e8d16a;
}

.state-disabled {
    color: var(--danger, #e06a6a);
    opacity: 0.85;
}

.diff-arrow {
    color: var(--muted);
    opacity: 0.6;
}

.diff-warning {
    margin-top: 0.3rem;
    font-size: 0.72rem;
    color: #e0b06a;
}

.equip-order-warning {
    padding: 0.35rem 0.7rem;
    font-size: 0.72rem;
    color: #e0b06a;
    background: rgba(224, 176, 106, 0.08);
    border-bottom: 1px solid var(--border);
}

.crys-import-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.7rem 1.1rem;
    border-top: 1px solid var(--border);
}

.version-warning-banner {
    background: rgba(245, 204, 117, 0.18);
    border-left-color: rgba(244, 206, 102, 0.55);
    color: var(--warning);
    padding: 0.6rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.85rem;
}

.version-warning-banner a {
    color: #fff;
    text-decoration: underline;
    margin-left: 0.3rem;
}
</style>
