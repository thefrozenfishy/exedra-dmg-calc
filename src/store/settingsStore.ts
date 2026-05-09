import { defineStore } from 'pinia'
import { ref, watch, type Ref } from 'vue'

const settingRefs = new Map<string, ReturnType<typeof ref>>()

export function useSetting<T>(key: string, defaultValue: T): Ref<T> {
  const store = useSettingsStore()

  if (settingRefs.has(key)) {
    return settingRefs.get(key) as Ref<T>
  }

  const stored = store.get(key, defaultValue) as T
  const localRef = ref<T>(stored)

  settingRefs.set(key, localRef)

  watch(localRef, (val) => {
    store.set(key, val)
  })

  return localRef
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
