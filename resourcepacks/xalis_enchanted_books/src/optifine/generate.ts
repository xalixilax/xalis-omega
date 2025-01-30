import path from "node:path";
import { citEnchantedBookFileTemplate } from "./templates";
import { getOutputFolder } from "../utils/utils";
import type { EnchantedBookList } from "../../enchants";

// Function to create files for each enchanted book
export function generateCitEnchantedBookPropertiesFile(
  outputFolder: string,
  enchantedBooks: EnchantedBookList
) {
  for (const modName in enchantedBooks) {
    const modPath = getOutputFolder(
      outputFolder,
      "assets/minecraft/optifine/cit",
      modName
    );

    for (const {enchantment, maxLevel} of enchantedBooks[modName]) {

      // Create files for each level
      for (let level = 1; level <= (maxLevel ?? 1); level++) {
        const fileName = `${enchantment}_${level}.properties`;
        const filePath = path.join(modPath, fileName);

        // Create the content based on the template
        const content = citEnchantedBookFileTemplate(
          modName,
          enchantment,
          level,
          maxLevel
        );

        // Write the file
        Bun.write(filePath, content);
      }
    }
  }
}
