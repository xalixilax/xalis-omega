import { readdir } from "node:fs/promises";
import { enchantedBooks } from "./enchants";
import {
  copyChangelogs,
  copyIcon,
  copyReadme,
  generateLicense,
  generateMcmeta,
} from "./src/utils/resourcepack";
import { splitHorizontalTilemap } from "./src/utils/canvas";
import { config } from "./resourcpack.config";
import { generateItemsEnchantedBook, generateMinecraftItemModels } from "./src/vanilla/generate";
import { generateCitEnchantedBookPropertiesFile } from "./src/optifine/generate";

const inputFolder = "./textures";

// Execute the function
generateCitEnchantedBookPropertiesFile(config.build.output, enchantedBooks);
generateItemsEnchantedBook(config.build.output);

generateMinecraftItemModels(enchantedBooks.minecraft, config.build.output);

generateMcmeta(config.build.output);
generateLicense(config.build.output);
copyReadme(config.build.output);
copyIcon(config.build.output);
copyChangelogs(config.build.output);
splitHorizontalTilemap(inputFolder, config.build.output).catch;
