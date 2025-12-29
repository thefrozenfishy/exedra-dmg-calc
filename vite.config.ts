import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'
import kiokuDataJson from './src/assets/base_data/kioku_data.json'

const characterMap = Object.fromEntries(
  Object.entries(kiokuDataJson).map(([name, data]) => [name, data.id])
)

export default defineConfig({
  build: {
    sourcemap: true
  },
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
