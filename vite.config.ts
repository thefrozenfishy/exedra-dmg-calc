import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'
import styleJson from './src/assets/base_data/getStyleMstList.json'

// kioku name -> styleMstId, for every collectable kioku (same set as kiokuData in src/utils/helpers.ts)
const characterMap: Record<string, number> = Object.fromEntries(
  styleJson.filter(style => style.isCollectionDisp).map(style => [style.name, style.styleMstId])
)

// Worker bundles (new Worker(new URL(...))) are built while the main build transforms the pages, all at once. The
// engine workers (Kioku Grid bench, Max Damage, Fight Solver) each pull in the whole engine and ~90 MB of game data,
// so building them concurrently takes a lot of memory: build them one after another instead. (The build still needs
// more than node's default 4 GB heap: package.json's build script raises it.)
let workerQueue: Promise<void> = Promise.resolve()
const serialWorkerBuilds = (): Plugin => {
  let release: (() => void) | undefined
  return {
    name: 'serial-worker-builds',
    async buildStart() {
      const previous = workerQueue
      workerQueue = new Promise<void>(resolve => { release = resolve })
      await previous
    },
    buildEnd(error) { if (error) release?.() },
    closeBundle() { release?.() },
  }
}

export default defineConfig({
  worker: {
    plugins: () => [serialWorkerBuilds()],
  },
  build: {
    sourcemap: true
  },
  optimizeDeps: { exclude: ["@jsquash/webp"] },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      frontmatter: true,
      markdownItSetup(md) {
        md.core.ruler.push('replace_character', state => {
          const charNames = Object.keys(characterMap).sort((a, b) => b.length - a.length).join('|')
          const regex = new RegExp(`\\b(${charNames})\\b`, 'g')

          for (const token of state.tokens) {
            if (token.type !== 'inline' || !token.children) continue

            token.children = token.children.flatMap(child => {
              if (child.type !== 'text') return child

              const parts = []
              let lastIndex = 0

              child.content.replace(regex, (match, _, offset) => {
                if (offset > lastIndex) {
                  parts.push({
                    type: 'text',
                    content: child.content.slice(lastIndex, offset)
                  })
                }

                parts.push({
                  type: 'html_inline',
                  content: `<CharacterLink name="${match}" id="${characterMap[match]}" />`
                })
                lastIndex = offset + match.length
              })

              if (lastIndex < child.content.length) {
                parts.push({
                  type: 'text',
                  content: child.content.slice(lastIndex)
                })
              }

              return parts.length ? parts : child
            })
          }
        })
      }
    })
  ],
  base: "/exedra-dmg-calc/",
})
