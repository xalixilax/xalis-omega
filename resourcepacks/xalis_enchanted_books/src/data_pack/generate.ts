import path from "node:path";
import type { EnchantedBook } from "../../enchants";
import { getOutputFolder } from "../utils/utils";

/**
 * Generates a Minecraft enchanted book model JSON with overrides for custom model data.
 * @param books - Array of enchantments and their max levels
 * @param outputFolder - Directory where the JSON file will be saved
 */
export function generateEnchantedBookOverrides(
  books: EnchantedBook[],
  outputFolder: string
) {
  let customModelData = 1; // Start at 1 and increment for each level

  const model = {
    parent: "minecraft:item/generated",
    textures: {
      layer0: "minecraft:item/enchanted_book",
    },
    overrides: books.flatMap(({ enchantment, maxLevel }) =>
      Array.from({ length: maxLevel ?? 1 }, (_, i) => {
        const modelData = customModelData++;
        const modelId = `${enchantment}_${i + 1}`;

        return {
          predicate: {
            custom_model_data: modelData,
          },
          model: `minecraft:item/${modelId}`,
        };
      })
    ),
  };

  const outputPath = getOutputFolder(outputFolder, "assets/minecraft/models/item");
const filePath = path.join(outputPath, "enchanted_book.json");

  Bun.write(filePath, JSON.stringify(model, null, 0));
}
