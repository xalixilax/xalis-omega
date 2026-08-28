export type AlphaTemplate = {
  id: string
  label: string
  url: string
}

export { alphaFromTemplate } from './mask'

function labelFromId(id: string): string {
  return id
    .split('_')
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(' ')
}

/**
 * Every `*.png` in this folder becomes an alpha template, discovered at
 * build time. Templates are opaque black/white sheets: white foreground =
 * visible base pixel. Filenames like `grass_block_20.png` turn into the id
 * `grass_block_20` and the label `Grass Block 20`.
 */
const templateModules = import.meta.glob<string>('./*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

export const alphaTemplates: AlphaTemplate[] = Object.entries(templateModules)
  .map(([path, url]) => {
    const id = path.replace(/^\.\//, '').replace(/\.png$/, '')
    return { id, label: labelFromId(id), url }
  })
  .sort((a, b) => a.label.localeCompare(b.label))

export const DEFAULT_TEMPLATE_ID = alphaTemplates.some(
  (template) => template.id === 'stone_0',
)
  ? 'stone_0'
  : (alphaTemplates[0]?.id ?? '')
