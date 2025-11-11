import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export function useSetting<T>(key: string, defaultValue: T) {
  const store = useSettingsStore()
  const stored = store.get(key, defaultValue)

  const localRef = ref<T>(stored)

  // whenever ref changes → save to store
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
