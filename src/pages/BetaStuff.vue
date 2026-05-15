<template>
    <div class="beta-settings">
        <h1>Beta Settings</h1>
        <p class="warning">
            Set these at your own risk.
        </p>

        <section v-for="section in sections" :key="section.title" class="section">
            <h2>{{ section.title }}</h2>

            <div v-for="setting in section.settings" :key="setting.key" class="setting">
                <div class="setting-header">
                    <label :for="setting.key">
                        {{ setting.label }}
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
.json-editor {
    width: 100%;
    min-height: 240px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #444;
    background: #111;
    color: white;
    font-family: monospace;
    font-size: 0.9rem;
    resize: vertical;
    box-sizing: border-box;
}

.beta-settings {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    color: #f5f5f5;
}

.warning {
    margin-bottom: 24px;
    color: #ffb86c;
}

.section {
    margin-bottom: 32px;
    padding: 20px;
    border-radius: 12px;
    background: #1e1e1e;
    border: 1px solid #333;
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
    color: #999;
}

.description {
    margin: 0 0 8px;
    color: #aaa;
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #444;
    background: #111;
    color: white;
    font-size: 1rem;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #6aa9ff;
}
</style>
