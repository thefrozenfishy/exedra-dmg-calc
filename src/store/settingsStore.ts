import { defineStore } from 'pinia'
import { computed, watch, effectScope, type WritableComputedRef } from 'vue'

const persistedKeys = new Set<string>()

export function useSetting<T>(key: string | (() => string), defaultValue: T): WritableComputedRef<T> {
  const store = useSettingsStore()
  const resolveKey = typeof key === 'function' ? key : () => key

  return computed<T>({
    get: () => {
      const k = resolveKey()
      ensureAutosave(store, k)
      return store.get(k, defaultValue) as T
    },
    set: (val) => store.set(resolveKey(), val)
  })
}

function ensureAutosave(store: ReturnType<typeof useSettingsStore>, key: string) {
  if (persistedKeys.has(key)) return
  persistedKeys.add(key)
  effectScope(true).run(() => {
    watch(() => store.data[key], () => store.save(), { deep: true })
  })
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    data: {} as Record<string, any>
  }),

  actions: {
    set(key: string, value: any) {
      this.data[key] = value
      this.save()
    },

    get(key: string, defaultValue?: any) {
      return this.data[key] ?? defaultValue
    },

    remove(key: string) {
      delete this.data[key]
      this.save()
    },

    save() {
      localStorage.setItem('settings', JSON.stringify(this.data))
    },

    load() {
      const saved = localStorage.getItem('settings')
      if (saved) {
        this.data = JSON.parse(saved)
      }
    }
  }
})
