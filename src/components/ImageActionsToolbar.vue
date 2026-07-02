<template>
    <div class="image-actions-toolbar">
        <div class="image-actions-buttons">
            <!-- Download -->
            <button class="icon-btn icon-btn--accent" :disabled="downloadLoading || disabled"
                :aria-label="downloadLoading ? 'Downloading…' : 'Download image'"
                :title="downloadLoading ? 'Downloading…' : 'Download image'" @click="handleDownload">
                <span v-if="downloadLoading" class="icon-spinner" aria-hidden="true" />
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M5 21h14" />
                </svg>
            </button>

            <!-- Extra icon slot (between share and copy) -->
            <slot />

            <!-- Copy image to clipboard -->
            <button class="icon-btn icon-btn--accent" :disabled="copyImageLoading || disabled"
                :aria-label="copyImageLoading ? 'Copying image…' : 'Copy image to clipboard'"
                :title="copyImageLoading ? 'Copying image…' : 'Copy image to clipboard'" @click="handleCopyImage">
                <span v-if="copyImageLoading" class="icon-spinner" aria-hidden="true" />
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <circle cx="9" cy="10" r="1.5" />
                    <path d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L14 14l1.5-1.5a2 2 0 0 1 2.8 0L20 14" />
                </svg>
            </button>

            <!-- Share -->
            <button class="icon-btn icon-btn--accent" :disabled="shareLinkLoading || disabled"
                :aria-label="shareLinkLoading ? 'Generating share link…' : 'Share image'"
                :title="shareLinkLoading ? 'Generating share link…' : 'Share image'" @click="handleShare">
                <span v-if="shareLinkLoading" class="icon-spinner" aria-hidden="true" />
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.6 13.5l6.8 4" />
                    <path d="M15.4 6.5l-6.8 4" />
                </svg>
            </button>

            <!-- URL input — shrinks to fill remaining space -->
            <template v-if="shareLinkUrl">
                <input class="share-link-input" type="text" readonly :value="shareLinkUrl"
                    @click="($event.target as HTMLInputElement).select()" />
            </template>
            <span v-else-if="shareLinkError" class="share-link-error">{{ shareLinkError }}</span>
            <input v-else class="share-link-input share-link-placeholder" type="text" readonly value=""
                placeholder="Click share to generate a link" />

            <!-- Copy icon button -->
            <button v-if="shareLinkUrl" class="icon-btn icon-btn--accent" :aria-label="copied ? 'Copied!' : 'Copy link'"
                :title="copied ? 'Copied!' : 'Copy link'" @click="copyShareLink">
                <!-- Checkmark when just copied -->
                <svg v-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
                <!-- Clipboard icon normally -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <!-- back document -->
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <!-- front document (with notch cut implied by the overlap) -->
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import {
    downloadImage,
    generateShareLink,
    generateShareLinkFromCanvas,
    copyImageToClipboardOrShareLink,
    copyCanvasToClipboard,
    copyTextToClipboard,
    type ImageExportOptions,
    type ShareLinkOptions,
} from "../utils/image"

type MaybeFn<T> = T | (() => T)

const props = defineProps<{
    target: MaybeFn<string | HTMLElement>
    canvas?: MaybeFn<HTMLCanvasElement | undefined>
    filename: MaybeFn<string>
    exportOptions?: MaybeFn<ImageExportOptions>
    shareOptions?: MaybeFn<ShareLinkOptions>
    disabled?: boolean
}>()

const resolve = <T,>(value: MaybeFn<T> | undefined): T | undefined =>
    typeof value === "function" ? (value as () => T)() : value

const downloadLoading = ref(false)
const copyImageLoading = ref(false)
const shareLinkLoading = ref(false)
const shareLinkUrl = ref<string | null>(null)
const shareLinkError = ref<string | null>(null)
const copied = ref(false)

const handleDownload = async () => {
    downloadLoading.value = true

    try {
        const filename = resolve(props.filename) ?? "image.png"
        const target = resolve(props.target)
        const exportOptions = resolve(props.exportOptions) ?? {}

        if (!target) throw new Error("No download target resolved")

        await downloadImage(filename, target, exportOptions)
    } catch (err) {
        console.error("Failed to download image:", err)
    } finally {
        downloadLoading.value = false
    }
}

const handleCopyImage = async () => {
    copyImageLoading.value = true

    try {
        const canvas = resolve(props.canvas)
        const shareOptions = resolve(props.shareOptions) ?? {}

        if (canvas) {
            const filename = resolve(props.filename) ?? "image.png"
            await copyCanvasToClipboard(filename, canvas)
            return
        }

        const target = resolve(props.target)
        const exportOptions = resolve(props.exportOptions) ?? {}

        if (!target) throw new Error("No copy target resolved")

        const result = await copyImageToClipboardOrShareLink(target, exportOptions, shareOptions)
        if (!result.copied) {
            shareLinkUrl.value = result.shareUrl
            shareLinkError.value = null
        }
    } catch (err) {
        console.error("Failed to copy image:", err)
    } finally {
        copyImageLoading.value = false
    }
}

const handleShare = async () => {
    shareLinkLoading.value = true
    shareLinkUrl.value = null
    shareLinkError.value = null

    try {
        const shareOptions = resolve(props.shareOptions) ?? {}
        const canvas = resolve(props.canvas)

        if (canvas) {
            shareLinkUrl.value = await generateShareLinkFromCanvas(canvas, shareOptions)
        } else {
            const target = resolve(props.target)
            if (!target) throw new Error("No share target resolved")

            const exportOptions = resolve(props.exportOptions) ?? {}
            shareLinkUrl.value = await generateShareLink(target, exportOptions, shareOptions)
        }
    } catch (err) {
        console.error("Failed to generate share link:", err)
        shareLinkError.value = "Failed to generate share link. Please try again."
    } finally {
        shareLinkLoading.value = false
    }
}

const copyShareLink = () => {
    if (shareLinkUrl.value) {
        copyTextToClipboard(shareLinkUrl.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
    }
}
</script>

<style scoped>
.image-actions-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.image-actions-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon-spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;

    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: currentColor;

    animation: icon-spinner-spin 0.8s linear infinite;
}

@keyframes icon-spinner-spin {
    to {
        transform: rotate(360deg);
    }
}

.share-link-input {
    flex: 1 1 0;
    min-width: 80px;
    max-width: 320px;

    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;

    font-family: inherit;
    font-size: 0.85rem;
}

.share-link-placeholder::placeholder {
    color: var(--muted);
}

.share-link-error {
    color: var(--danger);
    font-size: 0.9rem;
    flex-shrink: 0;
}
</style>
