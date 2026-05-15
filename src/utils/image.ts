import { toPng } from "html-to-image"
import { toast } from "vue3-toastify"

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

    try {
        const dataUrl = await toPng(el, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#242424",
            skipFonts: false
        })

        const blob = await (await fetch(dataUrl)).blob()

        const item = new ClipboardItem({ "image/png": blob })
        await navigator.clipboard.write([item])

        toast.success("Copied to clipboard!", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false
        })
    } catch (err) {
        console.error(err)

        try {
            const dataUrl = await toPng(el, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#242424",
                skipFonts: false
            })

            const blob = await (await fetch(dataUrl)).blob()
            await downloadImg(filename, blob)
        } catch (fallbackErr) {
            console.error("Image export failed completely:", fallbackErr)
            toast.error("Image export failed", {
                position: toast.POSITION.TOP_RIGHT,
                icon: false
            })
        }
    }
}

export const downloadImage = async (filename: string, target: string | HTMLElement) => {
    const el = getElement(target)
    if (!el) return

    try {
        const dataUrl = await toPng(el, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#242424",
            skipFonts: false
        })

        const blob = await (await fetch(dataUrl)).blob()
        await downloadImg(filename, blob)
    } catch (err) {
        console.error("Download failed:", err)
        toast.error("Download failed", {
            position: toast.POSITION.TOP_RIGHT,
            icon: false
        })
    }
}