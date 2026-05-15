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

export const useBetaStore = defineStore('betaValues', {
  state: () => ({
    data: {} as Record<string, any>
  }),

  actions: {
    set(key: string, value: any) {
      if (!this.data || typeof this.data !== "object" || Array.isArray(this.data)) {
        this.data = {}
      }

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
      localStorage.setItem("betaValues", JSON.stringify(this.data ?? {}))
    },

    load() {
      const saved = localStorage.getItem("betaValues")

      if (!saved) return

      try {
        const parsed = JSON.parse(saved)

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          this.data = parsed
        } else {
          console.warn("Invalid betaValues data, resetting")
          this.data = {}
        }
      } catch (err) {
        console.error("Failed to parse betaValues", err)
        this.data = {}
      }
    }
  }
})
