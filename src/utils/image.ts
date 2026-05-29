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

const compressPngBlob = (dataUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob(
                blob => {
                    blob ? resolve(blob) : reject(new Error("Failed"))
                },
                "image/png"
            )
        }
        img.onerror = reject
        img.src = dataUrl
    })
}

export const copyImageToClipboard = async (filename: string, target: string | HTMLElement) => {
    const el = getElement(target)
    if (!el) return
    const toastId = toast.loading("Copying to clipboard...", {
        position: toast.POSITION.TOP_RIGHT,
        icon: false
    })

    try {
        const blobPromise = toPng(el, {
            cacheBust: true,
            pixelRatio: 1,
            backgroundColor: "#242424",
            skipFonts: false
        }).then(dataUrl => compressPngBlob(dataUrl))

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
        const dataUrl = await toPng(el, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#242424",
            skipFonts: false
        })

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