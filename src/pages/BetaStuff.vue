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

                <p v-if="setting.description" class="description">
                    {{ setting.description }}
                </p>

                <input :id="setting.key" type="number" step="0.01" v-model.number="values[setting.key].value" />
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { useBeta } from "../store/betaStore"

type Setting = {
    key: string
    label: string
    defaultValue: number
    description?: string
}

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
</script>

<style scoped>
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
