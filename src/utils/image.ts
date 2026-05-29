import { toPng } from "html-to-image"
import { Id, toast } from "vue3-toastify"
import { ref, onMounted } from "vue"

const IMG_SETTINGS = {
    cacheBust: true,
    pixelRatio: 1,
    backgroundColor: "#242424",
    skipFonts: false
}

export interface ImageExportOptions {
    exportClass?: string;
    onBefore?: () => void | Promise<void>;
    onAfter?: () => void | Promise<void>;
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
    if (!ClipboardItem.supports("image/png")) return false
    try {
        const result = await navigator.permissions.query({ name: "clipboard-write" as PermissionName })
        return result.state === "granted" || result.state === "prompt"
    } catch {
        return false
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

const withExportState = async <T>(target: string | HTMLElement, options: ImageExportOptions = {}, fn: (el: HTMLElement) => Promise<T>): Promise<T | undefined> => {
    const el = getElement(target)
    if (!el) return

    if (options.onBefore) await options.onBefore()
    if (options.exportClass) el.classList.add(options.exportClass)

    if (options.exportClass || options.onBefore) {
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
    }

    try {
        return await fn(el)
    } finally {
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

const copyBlobToClipboard = async (filename: string, blob: Blob) => {
    const toastId = toast.loading("Copying to clipboard...", { position: toast.POSITION.TOP_RIGHT, icon: false })
    try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        toast.update(toastId, { render: "Copied to clipboard!", type: "success", isLoading: false, autoClose: 3000 })
    } catch (err) {
        console.error(err)
        try {
            await downloadBlob(filename, blob)
            toast.update(toastId, { render: "Clipboard unavailable, image downloaded instead", type: "info", isLoading: false, autoClose: 3000 })
        } catch (fallbackErr) {
            console.error("Image export failed completely:", fallbackErr)
            toast.update(toastId, { render: "Image export failed", type: "error", isLoading: false, autoClose: 3000 })
        }
    }
}

const openBlobInNewTab = (blob: Blob, toastId?: Id) => {
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    if (toastId) toast.update(toastId, { render: "Opened new tab!", type: "success", isLoading: false, autoClose: 3000 })
    setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export const openImageInNewTab = async (target: string | HTMLElement, options?: ImageExportOptions) => {
    await withExportState(target, options, async (el) => {
        const toastId = toast.loading("Opening tab...", { position: toast.POSITION.TOP_RIGHT, icon: false })
        const dataUrl = await toPng(el, IMG_SETTINGS)
        const blob = await fetch(dataUrl).then(r => r.blob())
        openBlobInNewTab(blob, toastId)
    })
}

export const copyImageToClipboard = async (filename: string, target: string | HTMLElement, options?: ImageExportOptions) => {
    await withExportState(target, options, async (el) => {
        const blob = await toPng(el, IMG_SETTINGS).then(dataUrl => fetch(dataUrl).then(r => r.blob()))
        await copyBlobToClipboard(filename, blob)
    })
}

export const downloadImage = async (filename: string, target: string | HTMLElement, options?: ImageExportOptions) => {
    await withExportState(target, options, async (el) => {
        const toastId = toast.loading("Downloading...", { position: toast.POSITION.TOP_RIGHT, icon: false })
        try {
            const dataUrl = await toPng(el, { ...IMG_SETTINGS, pixelRatio: 2 })
            const blob = await fetch(dataUrl).then(r => r.blob())
            await downloadBlob(filename, blob)
            toast.update(toastId, { render: `Downloaded as ${filename}`, type: "success", isLoading: false, autoClose: 3000 })
        } catch (err) {
            console.error("Download failed:", err)
            toast.update(toastId, { render: "Download failed", type: "error", isLoading: false, autoClose: 3000 })
        }
    })
}

export const copyCanvasToClipboard = async (filename: string, canvas: HTMLCanvasElement) => {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
    await copyBlobToClipboard(filename, blob)
}

export const openCanvasInImage = async (canvas: HTMLCanvasElement) => {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
    openBlobInNewTab(blob)
}

export const downloadCanvas = async (filename: string, canvas: HTMLCanvasElement) => {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
    await downloadBlob(filename, blob)
}