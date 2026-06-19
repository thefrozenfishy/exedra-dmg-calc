import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import "vue3-toastify/dist/index.css"
import CharacterLink from './components/CharacterLink.vue'
import { useSettingsStore } from './store/settingsStore';
import { useCharacterStore } from './store/characterStore'
import { useTeamStore, useEnemyStore, usePvPStore } from './store/singleTeamStore';
import { useFriendStore } from './store/friendStore';
import { useBetaStore } from './store/betaStore';
import { isBeta } from './utils/betaSettings'
import { logEvent } from './utils/analytics'

const app = createApp(App)

window.onerror = (message, source, lineno, colno, error) => {
    logEvent('js_error', {
        message: String(message),
        source,
        lineno,
        colno,
        stack: error?.stack ?? null,
        page: window.location.pathname,
    })
}

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason
    logEvent('js_error', {
        message: error?.message ?? String(error),
        stack: error?.stack ?? null,
        type: 'unhandled_promise_rejection',
        page: window.location.pathname,
    })
}

const originalConsoleError = console.error.bind(console)
console.error = (...args) => {
    originalConsoleError(...args)
    const error = args.find((a): a is Error => a instanceof Error)

    const message = error?.message ?? args
        .map(a => {
            if (typeof a === 'string') return a
            if (a instanceof Error) return a.message
            try {
                return JSON.stringify(a)
            } catch {
                return String(a)
            }
        })
        .join(' ')

    logEvent('js_error', {
        message,
        stack: error?.stack ?? null,
        type: 'console_error',
        page: window.location.pathname,
    })
}

app.config.errorHandler = (err, instance, info) => {
    console.error(
        '[Vue Error]',
        info,
        instance?.$options?.name,
        err
    )
}

app.component('CharacterLink', CharacterLink)
app.use(createPinia())
if (import.meta.env.DEV) {
    const favicon = document.getElementById("app-icon") as HTMLLinkElement;
    favicon.href = favicon.href.replace("icon.png", "icon-dev.png?v=" + Date.now());
} else if (isBeta()) {
    const favicon = document.getElementById("app-icon") as HTMLLinkElement;
    favicon.href = favicon.href.replace("icon.png", "icon-beta.png?v=" + Date.now());
}
try {
    useBetaStore().load()
    await useCharacterStore().initializeCloud()
    await useFriendStore().initialize()
    useTeamStore().load()
    usePvPStore().load()
    useEnemyStore().load()
    useSettingsStore().load()
} catch (err) {
    logEvent('app_boot_failed')
    console.error("Failed to initialize app:", err)
}
app.use(router)
app.mount('#app')
