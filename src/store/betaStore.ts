import { defineStore } from 'pinia'
import { ref, watch, type Ref } from 'vue'

const betaRefs = new Map<string, ReturnType<typeof ref>>()

export function useBeta<T>(key: string, defaultValue: T): Ref<T> {
  const store = useBetaStore()

  if (betaRefs.has(key)) {
    return betaRefs.get(key) as Ref<T>
  }

  const stored = store.get(key, defaultValue) as T
  const localRef = ref<T>(stored)

  betaRefs.set(key, localRef)

  watch(localRef, (val) => {
    store.set(key, val)
  })

  return localRef
}

export const useBetaStore = defineStore('beta', {
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
      localStorage.setItem('beta', JSON.stringify(this.data))
    },

    load() {
      const saved = localStorage.getItem('beta')
      if (saved) {
        this.data = JSON.parse(saved)
      }
    }
  }
})
