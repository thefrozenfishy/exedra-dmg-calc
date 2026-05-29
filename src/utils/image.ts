import { toPng } from "html-to-image"
import { toast } from "vue3-toastify"


const IMG_SETTINGS = {
    cacheBust: true,
    pixelRatio: 1,
    backgroundColor: "#242424",
    skipFonts: false
}

export const canWriteToClipboard = async (): Promise<boolean> => {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    if (!ClipboardItem.supports("image/png")) return false
    try {
        const result = await navigator.permissions.query({ name: "clipboard-write" as PermissionName })
        return result.state === "granted" || result.state === "prompt"
    } catch {
        return true
    }
}

export const openImageInNewTab = async (target: string | HTMLElement) => {
    const el = getElement(target)
    if (!el) return
    const dataUrl = await toPng(el, IMG_SETTINGS)
    window.open(dataUrl, "_blank")
}

function sanitizeFilename(input: string | null): string {
    return input?.normalize("NFKD").replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\.+$/, "") || "unknown"
}

const downloadImg = async (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = sanitizeFilename(filename)
    link.click()

    URL.revokeObjectURL(url)
}

const getElement = (target: string | HTMLElement): HTMLElement | null => {
    if (typeof target === "string") {
        return document.querySelector(target) as HTMLElement | null
    }
    return target
}

export const copyImageToClipboard = async (filename: string, target: string | HTMLElement) => {
    const el = getElement(target)
    if (!el) return
    const toastId = toast.loading("Copying to clipboard...", {
        position: toast.POSITION.TOP_RIGHT,
        icon: false
    })

    try {
        const blobPromise = toPng(el, IMG_SETTINGS).then(dataUrl => fetch(dataUrl).then(r => r.blob()))

        await navigator.clipboard.write([new ClipboardItem({ "image/png": blobPromise })])

        toast.update(toastId, {
            render: "Copied to clipboard!",
            type: "success",
            isLoading: false,
            autoClose: 3000
        })
    } catch (err) {
        console.error(err)
        try {
            downloadImage(filename, target)
            toast.update(toastId, {
                render: "Clipboard unavailable, image downloaded instead",
                type: "info",
                isLoading: false,
                autoClose: 3000
            })
        } catch (fallbackErr) {
            console.error("Image export failed completely:", fallbackErr)

            toast.update(toastId, {
                render: "Image export failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            })
        }
    }
}

export const downloadImage = async (filename: string, target: string | HTMLElement) => {
    const el = getElement(target)
    if (!el) return
    const toastId = toast.loading("Downloading...", {
        position: toast.POSITION.TOP_RIGHT,
        icon: false
    })

    try {
        const dataUrl = await toPng(el, { ...IMG_SETTINGS, pixelRatio: 2, })

        const blob = await (await fetch(dataUrl)).blob()
        await downloadImg(filename, blob)
        toast.update(toastId, {
            render: `Downloaded as ${filename}`,
            type: "success",
            isLoading: false,
            autoClose: 3000
        })
    } catch (err) {
        console.error("Download failed:", err)
        toast.update(toastId, {
            render: "Download failed",
            type: "error",
            isLoading: false,
            autoClose: 3000
        })
    }
}