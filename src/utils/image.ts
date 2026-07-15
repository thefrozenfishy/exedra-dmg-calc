import { toPng } from "html-to-image"
import { toast } from "vue3-toastify"
import { ref, onMounted } from "vue"
import { getSupabase } from "./supabase"
import { getUserId } from "../store/user"

const MISSING_IMAGE_PLACEHOLDER =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="

const BASE_IMG_SETTINGS = {
    cacheBust: true,
    backgroundColor: "#242424",
    skipFonts: false,
    imagePlaceholder: MISSING_IMAGE_PLACEHOLDER,
}

const MAX_CANVAS_SIDE_PX = 16_000

const SHARE_MAX_BYTES = 50 * 1024 * 1024 * 0.8

const safeSettings = (el: HTMLElement, pixelRatio: number, maxBytes = Infinity) => {
    const naturalWidth = el.scrollWidth
    const naturalHeight = el.scrollHeight

    const scaledWidth = naturalWidth * pixelRatio

    const maxHeightByCanvas = Math.floor(MAX_CANVAS_SIDE_PX / pixelRatio)

    const maxHeightByBytes = Math.floor(maxBytes / (scaledWidth * pixelRatio * 4))

    const clampedHeight = Math.min(naturalHeight, maxHeightByCanvas, maxHeightByBytes)

    return {
        ...BASE_IMG_SETTINGS,
        pixelRatio,
        width: naturalWidth,
        height: clampedHeight,
    }
}

const imgSettings = (el: HTMLElement) => safeSettings(el, 2)
const highResSettings = (el: HTMLElement) => safeSettings(el, 2)
const shareSettings = (el: HTMLElement) => safeSettings(el, 2, SHARE_MAX_BYTES)

const escapeSvgText = (text: string): string =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")

const wrapPlaceholderText = (text: string, maxCharsPerLine = 12, maxLines = 3): string[] => {
    const words = text.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ""

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (candidate.length > maxCharsPerLine && current) {
            lines.push(current)
            current = word
        } else {
            current = candidate
        }
    }
    if (current) lines.push(current)

    if (lines.length > maxLines) {
        return [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]}…`]
    }
    return lines
}

export const buildBrokenImagePlaceholder = (label?: string | null): string => {
    const trimmedLabel = (label ?? "").trim()
    const isFallback = trimmedLabel === ""
    const lines = isFallback ? ["?"] : wrapPlaceholderText(trimmedLabel)
    const fontSize = isFallback ? 40 : 13
    const lineHeight = fontSize * 1.2
    const startY = 50 - ((lines.length - 1) * lineHeight) / 2

    const tspans = lines
        .map((line, i) => `<tspan x="50" y="${startY + i * lineHeight}">${escapeSvgText(line)}</tspan>`)
        .join("")

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#3a3a3a"/>
  <text font-size="${fontSize}" fill="#888" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">${tspans}</text>
</svg>`

    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const BROKEN_IMAGE_PLACEHOLDER = buildBrokenImagePlaceholder()

export const onImgError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (img.dataset.brokenImage) return
    img.dataset.brokenImage = "true"
    img.onerror = null
    img.src = buildBrokenImagePlaceholder(img.alt)
}

export interface ImageExportOptions {
    exportClass?: string;
    onBefore?: () => void | Promise<void>;
    onAfter?: () => void | Promise<void>;
}

const isBrokenImage = (img: HTMLImageElement) => img.complete && img.naturalWidth === 0

const sanitizeBrokenImages = (root: HTMLElement): (() => void) => {
    const images = Array.from(root.querySelectorAll("img")) as HTMLImageElement[]
    if (root instanceof HTMLImageElement) images.push(root)

    const restores: Array<() => void> = []

    for (const img of images) {
        if (!isBrokenImage(img)) continue

        const originalSrc = img.src
        const originalSrcset = img.srcset

        img.srcset = ""
        img.src = buildBrokenImagePlaceholder(img.alt)

        restores.push(() => {
            img.src = originalSrc
            img.srcset = originalSrcset
        })
    }

    return () => restores.forEach(restore => restore())
}

export const useClipboardSupport = () => {
    const clipboardSupported = ref(true)
    onMounted(async () => {
        clipboardSupported.value = await canWriteToClipboard()
    })
    return { clipboardSupported }
}

export const canWriteToClipboard = async (): Promise<boolean> => {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    if (ClipboardItem.supports && !ClipboardItem.supports("image/png")) return false

    const isFirefoxAndroid = /Android.*Firefox/i.test(navigator.userAgent)
    if (isFirefoxAndroid) return false

    try {
        const result = await navigator.permissions.query({ name: "clipboard-write" as PermissionName })
        return result.state === "granted" || result.state === "prompt"
    } catch {
        return true
    }
}

const getElement = (target: string | HTMLElement): HTMLElement | null => {
    if (typeof target === "string") {
        return document.querySelector(target) as HTMLElement | null
    }
    return target
}

function sanitizeFilename(input: string | null): string {
    return input?.normalize("NFKD").replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\.+$/, "") || "unknown"
}

const withExportState = async <T>(el: HTMLElement, options: ImageExportOptions = {}, fn: (el: HTMLElement) => Promise<T>): Promise<T> => {
    if (options.onBefore) await options.onBefore()
    if (options.exportClass) el.classList.add(options.exportClass)

    if (options.exportClass || options.onBefore) {
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
    }

    const restoreImages = sanitizeBrokenImages(el)

    try {
        return await fn(el)
    } finally {
        restoreImages()
        if (options.exportClass) el.classList.remove(options.exportClass)
        if (options.onAfter) await options.onAfter()
    }
}

const downloadBlob = async (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = sanitizeFilename(filename)
    link.click()
    URL.revokeObjectURL(url)
}

const writeBlobPromiseToClipboard = async (filename: string, blobPromise: Promise<Blob>) => {
    const toastId = toast.loading("Copying to clipboard...", { position: toast.POSITION.TOP_RIGHT, icon: false })

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blobPromise })
        ])
        toast.update(toastId, { render: "Copied to clipboard!", type: "success", isLoading: false, autoClose: 3000 })
    } catch (err) {
        console.error("Clipboard write failed, triggering fallback:", err)
        try {
            const blob = await blobPromise
            await downloadBlob(filename, blob)
            toast.update(toastId, { render: "Clipboard unavailable, image downloaded instead", type: "info", isLoading: false, autoClose: 3000 })
        } catch (fallbackErr) {
            console.error("Image export failed completely:", fallbackErr)
            toast.update(toastId, { render: "Image export failed", type: "error", isLoading: false, autoClose: 3000 })
        }
    }
}

export const openImageInNewTab = async (target: string | HTMLElement, options?: ImageExportOptions) => {
    const el = getElement(target)
    if (!el) {
        toast.error("Target element not found", { position: toast.POSITION.TOP_RIGHT })
        return
    }

    const newTab = window.open("", "_blank")
    if (!newTab) {
        toast.error("Popup blocked! Please allow popups for this site.", { position: toast.POSITION.TOP_RIGHT })
        return
    }

    newTab.document.write(`
        <html>
        <head>
            <title>Generating Image...</title>
            <style>
                body { background: #242424; color: #eee; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                .spinner { width: 48px; height: 48px; border: 5px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top-color: #b57edc; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin-bottom: 1.25rem; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h2 { font-weight: 500; font-size: 1.1rem; letter-spacing: 0.05em; color: #aaa; margin: 0; }
            </style>
        </head>
        <body>
            <div class="spinner"></div>
            <h2>Generating image...</h2>
        </body>
        </html>
    `)
    newTab.document.close()

    const toastId = toast.loading("Opening tab...", { position: toast.POSITION.TOP_RIGHT, icon: false })

    try {
        const url = await withExportState(el, options, async (element) => {
            const dataUrl = await toPng(element, highResSettings(element))
            const blob = await fetch(dataUrl).then(r => r.blob())
            return URL.createObjectURL(blob)
        })

        newTab.location.href = url
        toast.update(toastId, { render: "Opened new tab!", type: "success", isLoading: false, autoClose: 3000 })
        setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
        console.error("Image generation failed:", err)
        newTab.close()
        toast.update(toastId, { render: "Failed to generate image", type: "error", isLoading: false, autoClose: 3000 })
    }
}

export const copyImageToClipboard = async (filename: string, target: string | HTMLElement, options?: ImageExportOptions) => {
    const el = getElement(target)
    if (!el) {
        toast.error("Target element not found", { position: toast.POSITION.TOP_RIGHT })
        return
    }

    const blobPromise = withExportState(el, options, async (element) => {
        const dataUrl = await toPng(element, imgSettings(element))
        return fetch(dataUrl).then(r => r.blob())
    })

    await writeBlobPromiseToClipboard(filename, blobPromise)
}

const SHARE_BUCKET = "share-images"

function randomId(): string {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12)
}

const uploadBlobForSharing = async (blob: Blob): Promise<{ path: string, publicUrl: string, shareId: string }> => {
    const supabase = getSupabase()
    const userId = getUserId() ?? "anon"
    const shareId = randomId()

    const path = `${userId}/${Date.now()}-${shareId}.png`

    const { error: uploadError } = await supabase.storage
        .from(SHARE_BUCKET)
        .upload(path, blob, {
            contentType: "image/png",
            cacheControl: "31536000", // 1 year -- this file never changes once uploaded
        })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(SHARE_BUCKET).getPublicUrl(path)

    return { path, publicUrl: data.publicUrl, shareId }
}

export interface ShareLinkOptions {
    title?: string
    backUrl?: string
}

const createSharePage = async (shareId: string, imageUrl: string, opts: ShareLinkOptions = {}): Promise<string> => {
    const supabase = getSupabase()

    const { data, error } = await supabase.functions.invoke("create-share-page", {
        body: {
            shareId,
            imageUrl,
            title: opts.title,
            backUrl: opts.backUrl,
        },
    })

    if (error) {
        console.error("create-share-page failed, falling back to raw image URL:", error)
        return imageUrl
    }

    return data?.url ?? imageUrl
}

export const generateShareLink = async (
    target: string | HTMLElement,
    options?: ImageExportOptions,
    shareOpts?: ShareLinkOptions
): Promise<string> => {
    const el = getElement(target)
    if (!el) {
        throw new Error("Target element not found")
    }

    const blob = await withExportState(el, options, async (element) => {
        const dataUrl = await toPng(element, shareSettings(element))
        return fetch(dataUrl).then(r => r.blob())
    })

    const { publicUrl, shareId } = await uploadBlobForSharing(blob)
    return await createSharePage(shareId, publicUrl, shareOpts)
}

export const copyImageToClipboardOrShareLink = async (
    target: string | HTMLElement,
    options?: ImageExportOptions,
    shareOpts?: ShareLinkOptions
): Promise<{ copied: true } | { copied: false; shareUrl: string }> => {
    const el = getElement(target)
    if (!el) {
        toast.error("Target element not found", { position: toast.POSITION.TOP_RIGHT })
        throw new Error("Target element not found")
    }

    const toastId = toast.loading("Copying to clipboard...", { position: toast.POSITION.TOP_RIGHT, icon: false })

    let blob: Blob
    try {
        blob = await withExportState(el, options, async (element) => {
            const dataUrl = await toPng(element, imgSettings(element))
            return fetch(dataUrl).then(r => r.blob())
        })
    } catch (err) {
        console.error("Image generation failed:", err)
        toast.update(toastId, { render: "Image export failed", type: "error", isLoading: false, autoClose: 3000 })
        throw err
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
        ])
        toast.update(toastId, { render: "Copied to clipboard!", type: "success", isLoading: false, autoClose: 3000 })
        return { copied: true }
    } catch (err) {
        console.error("Clipboard write failed, falling back to share link:", err)
        try {
            const { publicUrl, shareId } = await uploadBlobForSharing(blob)
            const shareUrl = await createSharePage(shareId, publicUrl, shareOpts)
            toast.update(toastId, {
                render: "Couldn't save image to clipboard — use the copy button next to the link instead",
                type: "error",
                isLoading: false,
                autoClose: 6000,
            })
            return { copied: false, shareUrl }
        } catch (fallbackErr) {
            console.error("Share link fallback failed:", fallbackErr)
            toast.update(toastId, { render: "Couldn't copy image or create a share link", type: "error", isLoading: false, autoClose: 3000 })
            throw fallbackErr
        }
    }
}

export const generateShareLinkFromCanvas = async (
    canvas: HTMLCanvasElement,
    shareOpts?: ShareLinkOptions
): Promise<string> => {
    const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
    )

    const { publicUrl, shareId } = await uploadBlobForSharing(blob)
    return await createSharePage(shareId, publicUrl, shareOpts)
}

export const copyTextToClipboard = async (text: string, successMessage = "Copied to clipboard!") => {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(successMessage, { position: toast.POSITION.TOP_RIGHT, icon: false })
        return true
    } catch (err) {
        console.error("Clipboard write failed:", err)
        toast.error("Couldn't copy to clipboard", { position: toast.POSITION.TOP_RIGHT, icon: false })
        return false
    }
}

export const downloadImage = async (filename: string, target: string | HTMLElement, options?: ImageExportOptions) => {
    const el = getElement(target)
    if (!el) {
        toast.error("Target element not found", { position: toast.POSITION.TOP_RIGHT })
        return
    }

    const toastId = toast.loading("Downloading...", { position: toast.POSITION.TOP_RIGHT, icon: false })
    try {
        await withExportState(el, options, async (element) => {
            const dataUrl = await toPng(element, highResSettings(element))
            const blob = await fetch(dataUrl).then(r => r.blob())
            await downloadBlob(filename, blob)
        })
        toast.update(toastId, { render: `Downloaded as ${filename}`, type: "success", isLoading: false, autoClose: 3000 })
    } catch (err) {
        console.error("Download failed:", err)
        toast.update(toastId, { render: "Download failed", type: "error", isLoading: false, autoClose: 3000 })
    }
}

export const copyCanvasToClipboard = async (filename: string, canvas: HTMLCanvasElement) => {
    const blobPromise = new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
    })
    await writeBlobPromiseToClipboard(filename, blobPromise)
}

export const openCanvasInImage = async (canvas: HTMLCanvasElement) => {
    const toastId = toast.loading("Opening image...", { position: toast.POSITION.TOP_RIGHT, icon: false })
    try {
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
        toast.update(toastId, { render: "Opened image!", type: "success", isLoading: false, autoClose: 3000 })
        setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
        console.error(err)
        toast.update(toastId, { render: "Failed to open canvas", type: "error", isLoading: false, autoClose: 3000 })
    }
}

export const downloadCanvas = async (filename: string, canvas: HTMLCanvasElement) => {
    const toastId = toast.loading("Downloading...", { position: toast.POSITION.TOP_RIGHT, icon: false })
    try {
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
        await downloadBlob(filename, blob)
        toast.update(toastId, { render: `Downloaded as ${filename}`, type: "success", isLoading: false, autoClose: 3000 })
    } catch (err) {
        console.error(err)
        toast.update(toastId, { render: "Download failed", type: "error", isLoading: false, autoClose: 3000 })
    }
}
