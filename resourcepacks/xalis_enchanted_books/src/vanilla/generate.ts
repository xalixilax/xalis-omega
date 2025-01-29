import path from "node:path";
import type { EnchantedBook, EnchantedBookList } from "../../enchants";
import type { StoredEnchantment } from "./types";
import fs from "node:fs";
import { enchantedBookModelItemTemplate } from "./templates";
import { getOutputFolder, saveJsonToFile } from "../utils/utils";
import { enchantedBooks } from "../../enchants";

type ModelFallback = {
  type: "minecraft:model";
  model: string;
};
export function generateMinecraftItem(books: EnchantedBook[]) {
  return {
    model: {
      type: "minecraft:select",
      property: "minecraft:component",
      component: "minecraft:stored_enchantments",
      cases: books.flatMap(({ enchantment, maxLevel = 1 }) =>
        Array.from({ length: maxLevel }, (_, i) => ({
          when: { [`minecraft:${enchantment}`]: i + 1 },
          model: {
            type: "minecraft:model",
            model: `minecraft:item/${enchantment}_${i + 1}`,
          },
        }))
      ),
      fallback: {
        type: "minecraft:model",
        model: "minecraft:item/enchanted_book",
      },
    },
  };
}

/**
 * Generates Minecraft item model JSON files for a list of enchantments and levels.
 */
export function generateMinecraftItemModels(
  books: EnchantedBook[],
  baseDir: string
) {
  const outputFolder = getOutputFolder(baseDir, "assets/minecraft/models/item");

  for (const { enchantment, maxLevel } of books) {
    for (let level = 1; level <= (maxLevel ?? 1); level++) {
      const model = enchantedBookModelItemTemplate(enchantment, level);

      saveJsonToFile(outputFolder, `${enchantment}_${level}.json`, model);
    }
  }
}

export function generateItemsEnchantedBook(baseDir: string) {
  const minecraftEnchantedBooks = enchantedBooks.minecraft;

  const content = generateMinecraftItem(minecraftEnchantedBooks);

  const outputFile = getOutputFolder(baseDir, "assets/minecraft/items");

  saveJsonToFile(outputFile, "enchanted_book.json", content);
}
