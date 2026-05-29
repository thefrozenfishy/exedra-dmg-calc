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
                body {
                    background: #242424;
                    color: #eee;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: sans-serif;
                }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 5px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    border-top-color: #b57edc; /* Matches your app's badge colors */
                    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    margin-bottom: 1.25rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h2 {
                    font-weight: 500;
                    font-size: 1.1rem;
                    letter-spacing: 0.05em;
                    color: #aaa;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="spinner"></div>
            <h2>Generating image...</h2>
        </body>
        </html>
    `)
    newTab.document.close()

    await withExportState(target, options, async (el) => {
        const toastId = toast.loading("Opening tab...", { position: toast.POSITION.TOP_RIGHT, icon: false })

        try {
            const dataUrl = await toPng(el, IMG_SETTINGS)
            const blob = await fetch(dataUrl).then(r => r.blob())
            const url = URL.createObjectURL(blob)

            newTab.location.href = url

            toast.update(toastId, { render: "Opened new tab!", type: "success", isLoading: false, autoClose: 3000 })
            setTimeout(() => URL.revokeObjectURL(url), 10000)
        } catch (err) {
            console.error("Image generation failed:", err)
            newTab.close()
            toast.update(toastId, { render: "Failed to generate image", type: "error", isLoading: false, autoClose: 3000 })
        }
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