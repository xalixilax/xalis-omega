import softStoneUrl from "./soft-stone.png"

export type TemplateEntry = {
  id: string
  label: string
  url: string
}

export const templates: TemplateEntry[] = [
  { id: "soft-stone", label: "Soft Stone", url: softStoneUrl },
]

export const defaultTemplateId = "soft-stone"