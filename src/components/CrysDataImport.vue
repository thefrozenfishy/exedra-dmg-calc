<template>
    <section class="card">
        <span class="filters-heading">Import</span>
        <div class="toolbar-right">
            <button class="btn btn-sm" @click="triggerImportFile">Import Crys Data and Kioku Levels</button>
            <NewBadge id="import-crys-data" />
            <input ref="importFileInputRef" type="file" accept=".json,application/json" class="hidden-file-input"
                @change="onImportFileChange" />
        </div>
        <a href="https://github.com/thefrozenfishy/exedra-crys-reader" class="external-link" target="_blank"
            rel="noopener noreferrer">
            Use this account reader to generate your import file automatically
            <svg class="external-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        </a>
    </section>

    <CrysImportModal v-model="showImportModal" :diff-characters="importDiff" @apply="onApplyImport"
        :version-warning="importVersionWarning" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NewBadge from './NewBadge.vue'
import CrysImportModal from './CrysImportModal.vue'
import { useCharacterStore } from '../store/characterStore'
import { buildCrysImportDiff, applyCrysImportDiff, extractImportVersion, type CrysDiffCharacter, type CrysImportData } from '../utils/crysImport'

const store = useCharacterStore()

const importFileInputRef = ref<HTMLInputElement | null>(null)
const showImportModal = ref(false)
const importDiff = ref<CrysDiffCharacter[]>([])
const importVersionWarning = ref<{ message: string; url: string } | null>(null)

function triggerImportFile() {
    importFileInputRef.value?.click()
}

async function checkGitVersionMatch(importedVersion: string) {
    try {
        const res = await fetch("https://api.github.com/repos/thefrozenfishy/exedra-crys-reader/releases/latest")
        if (res.ok) {
            const data = await res.json()
            const gitVersion = (data.tag_name || "").replace(/^version-/, "").replace(/^v/, "")
            const cleanImported = importedVersion.replace(/^version-/, "").replace(/^v/, "")

            if (Number(gitVersion) > Number(cleanImported)) {
                importVersionWarning.value = {
                    message: `New version available: v${gitVersion}, you are on ${importedVersion}`,
                    url: `https://github.com/thefrozenfishy/exedra-crys-reader/releases/tag/version-${gitVersion}`
                }
            } else {
                importVersionWarning.value = null
            }
        }
    } catch (e) {
        console.error("Failed to get git version", e)
    }
}

function onImportFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
        try {
            const parsed = JSON.parse(ev.target?.result as string) as CrysImportData

            importVersionWarning.value = null
            const importedVersion = extractImportVersion(parsed)
            if (importedVersion) {
                await checkGitVersionMatch(importedVersion.toString())
            }

            const diff = buildCrysImportDiff(store.characters, parsed)

            if (!diff.length) {
                alert("No differences found between your saved data and this file.")
                return
            }

            importDiff.value = diff
            showImportModal.value = true
        } catch (err) {
            console.error("Failed to parse crys import file:", err)
            alert("Couldn't read that file. Make sure it's a valid crys export JSON.")
        }
    }
    reader.onerror = () => {
        console.error("Failed to read crys import file:", reader.error)
        alert("Couldn't read that file.")
    }
    reader.readAsText(file)

    input.value = ""
}

function onApplyImport(selectedKeys: Set<string>) {
    applyCrysImportDiff(store.updateChar, importDiff.value, selectedKeys)
    importDiff.value = []
}
</script>

<style scoped>
.card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 1rem;
    margin-bottom: 0.6rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.hidden-file-input {
    display: none;
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

.btn-sm {
    padding: 0.28rem 0.65rem;
    font-size: 0.78rem;
}

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-right: 0.25rem;
    flex-shrink: 0;
    opacity: 0.7;
}

.external-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.74rem;
    color: var(--accent-soft);
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-right: 2px;
    transition: color 0.15s ease;
}

.external-link:hover {
    color: var(--accent);
}

.external-link-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
}
</style>
