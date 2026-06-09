<template>
    <div class="beta-settings">
        <h2>Beta Settings</h2>
        <p class="warning">
            Set these at your own risk.
        </p>

        <section v-for="section in sections" :key="section.title" class="section">
            <h2>{{ section.title }}</h2>

            <div v-for="setting in section.settings" :key="setting.key" class="setting">
                <div class="setting-header">
                    <label :for="setting.key">
                        {{ setting.label }}

                        <span v-if="hasChanged(setting)" class="changed-dot" title="Changed from default" />
                    </label>

                    <span class="default">
                        Default: {{ setting.defaultValue }}
                    </span>
                </div>

                <input v-if="!isJsonSetting(setting.defaultValue)" :id="setting.key"
                    v-model.lazy="values[setting.key].value" />

                <textarea v-else :id="setting.key" :value="jsonValues[setting.key]"
                    @change="onJsonChange(setting.key, $event)" class="json-editor" />
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { useBeta } from "../store/betaStore"
import { BETA_SECTIONS } from "../utils/betaSettings"

const sections = BETA_SECTIONS

const values: Record<string, ReturnType<typeof useBeta>> = {}

for (const section of sections) {
    for (const setting of section.settings) {
        values[setting.key] = useBeta(
            setting.key,
            setting.defaultValue
        )
    }
}

function normalizeValue(value: unknown): unknown {
    if (typeof value === "string") {
        const trimmed = value.trim()

        if (trimmed === "true") {
            return true
        }

        if (trimmed === "false") {
            return false
        }

        if (trimmed !== "" && !isNaN(Number(trimmed))) {
            return Number(trimmed)
        }
    }

    return value
}

function hasChanged(setting: { key: string; defaultValue: unknown }) {
    const current = normalizeValue(values[setting.key].value)
    const defaultValue = normalizeValue(setting.defaultValue)

    return JSON.stringify(current) !== JSON.stringify(defaultValue)
}

function isJsonSetting(value: unknown): boolean {
    return typeof value === "object" && value !== null
}

const jsonValues: Record<string, string> = {}

for (const section of sections) {
    for (const setting of section.settings) {
        if (isJsonSetting(setting.defaultValue)) {
            jsonValues[setting.key] = JSON.stringify(
                values[setting.key].value,
                null,
                2
            )
        }
    }
}

function onJsonChange(key: string, event: Event) {
    const target = event.target as HTMLTextAreaElement

    try {
        const parsed = JSON.parse(target.value)

        values[key].value = parsed
        jsonValues[key] = JSON.stringify(parsed, null, 2)
    }
    catch (err) {
        console.error(`Invalid JSON for ${key}`, err)
    }
}
</script>

<style scoped>
.changed-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-left: 8px;
    border-radius: 50%;
    background: rgba(255, 209, 110, 0.3);
    box-shadow: 0 0 8px rgba(255, 209, 110, 0.45);
}

.json-editor {
    width: 100%;
    min-height: 240px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font-family: monospace;
    font-size: 0.9rem;
    resize: vertical;
    box-sizing: border-box;
}

.beta-settings {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    color: var(--text);
}

.warning {
    margin-bottom: 24px;
    color: rgba(255, 209, 110, 0.9);
}

.section {
    margin-bottom: 32px;
    padding: 20px;
    border-radius: 12px;
    background: rgba(18, 13, 25, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.section h2 {
    margin-top: 0;
    margin-bottom: 20px;
}

.setting {
    margin-bottom: 18px;
}

.setting:last-child {
    margin-bottom: 0;
}

.setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    gap: 16px;
}

label {
    font-weight: 600;
}

.default {
    font-size: 0.85rem;
    color: var(--muted);
}

.description {
    margin: 0 0 8px;
    color: var(--muted);
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font-size: 1rem;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: rgba(255, 209, 110, 0.45);
}
</style>
