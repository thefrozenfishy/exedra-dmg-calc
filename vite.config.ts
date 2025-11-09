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
          const charNames = Object.keys(characterMap).join('|')
          const regex = new RegExp(`\\b(${charNames})\\b`, 'g')

          for (const token of state.tokens) {
            if (token.type === 'inline') {
              const newChildren = []
              let lastIndex = 0
              const text = token.content

              text.replace(regex, (match, _, offset) => {
                if (offset > lastIndex) {
                  newChildren.push({
                    type: 'text',
                    content: text.slice(lastIndex, offset)
                  })
                }
                newChildren.push({
                  type: 'html_inline',
                  content: `<CharacterLink name="${match}" id="${characterMap[match]}" />`
                })
                lastIndex = offset + match.length
              })

              if (lastIndex < text.length) {
                newChildren.push({
                  type: 'text',
                  content: text.slice(lastIndex)
                })
              }

              token.children = newChildren
            }
          }
        })
      }
    })
  ],
  base: "/exedra-dmg-calc/",
})
