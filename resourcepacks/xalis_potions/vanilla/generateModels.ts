import { potions } from "../data/potions.ts";
import { join } from "node:path";
import { config } from "../config.ts";
import { getPotionAssetName } from "../utils/utils";

const potionPrefix = {
  p: "",
  s: "splash_",
  l: "lingering_",
} as const;

const potionAttributes = {
  s: "strong_",
  l: "long_",
} as const;

function generateModel(name: string, type: "p" | "s" | "l", variant?: "l" | "s") {
  generateLegacyVanillaModel(name, type, variant);
  generateVanillaModel(name, type, variant);
  generateOptifineModel(name, type, variant);
  generateOptifineLegacyModel(name, type, variant);
}

function generateVanillaModel(
  name: string,
  type: "p" | "s" | "l",
  variant?: "l" | "s"
) {
  const assetName = getPotionAssetName(name, type, variant);
  const modelData = {
    parent: "minecraft:item/generated",
    textures: {
      // layer0: `minecraft:item/invisible`,
      layer0: `minecraft:item/${assetName}`,
    },
  };

  const folder = join(
    config.build.output,
    "55",
    "assets",
    "minecraft",
    "models",
    "item"
  );

  const filePath = join(folder, `${assetName}.json`);

  //writeFileSync(filePath, JSON.stringify(modelData, null, 2));
  Bun.write(filePath, JSON.stringify(modelData, null, 2));
}

// Legacy model takes an invisible layer to remove tinting effects
function generateLegacyVanillaModel(
  name: string,
  type: "p" | "s" | "l",
  variant?: "l" | "s"
) {
  const assetName = getPotionAssetName(name, type, variant);
  const modelData = {
    parent: "minecraft:item/generated",
    textures: {
      layer0: `minecraft:item/o`,
      layer1: `minecraft:item/${assetName}`,
    },
  };

  const folder = join(
    config.build.output,
    "assets",
    "minecraft",
    "models",
    "item"
  );

  const filePath = join(folder, `${assetName}.json`);

  Bun.write(filePath, JSON.stringify(modelData, null, 2));
}

function generateOptifineLegacyModel(
  name: string,
  type: "p" | "s" | "l",
  variant?: "l" | "s"
) {
  const assetName = getPotionAssetName(name, type, variant);

  const optifineData = `type=item
items=${potionPrefix[type]}potion
nbt.Potion=minecraft:${variant ? potionAttributes[variant] : ""}${name}
model=item/${assetName}`;

  const folder = join(
    config.build.output,
    "assets",
    "minecraft",
    "optifine",
    "cit"
  );

  const optifineFilePath = join(folder, `${assetName}.properties`);

  Bun.write(optifineFilePath, optifineData);
}

function generateOptifineModel(
  name: string,
  type: "p" | "s" | "l",
  variant?: "l" | "s"
) {
  const assetName = getPotionAssetName(name, type, variant);

  const optifineData = `type=item
items=${potionPrefix[type]}potion
components.potion_contents.potion=minecraft:${variant ? potionAttributes[variant] : ""}${name}
model=item/${assetName}`;

  const folder = join(
    config.build.output,
    "32-64",
    "assets",
    "minecraft",
    "optifine",
    "cit"
  );

  const optifineFilePath = join(folder, `${assetName}.properties`);

  Bun.write(optifineFilePath, optifineData);
}

function generatePotionVariants(potion: {
  potion: string;
  long?: boolean;
  strong?: boolean;
}) {
  const name = potion.potion;

  // Generate base variants (potion, splash, lingering)
  generateModel(name, "p"); // potion
  generateModel(name, "s"); // splash
  generateModel(name, "l"); // lingering

  // Generate long variants if enabled
  if (potion.long) {
    generateModel(name, "p", "l");
    generateModel(name, "s", "l");
    generateModel(name, "l", "l");
  }

  // Generate strong variants if enabled
  if (potion.strong) {
    generateModel(name, "p", "s");
    generateModel(name, "s", "s");
    generateModel(name, "l", "s");
  }

  console.log(`Generated ${name} variants`);
}

export function execute() {
  for (const [namespace, potionList] of Object.entries(potions)) {
    for (const potion of potionList) {
      generatePotionVariants(potion);
    }
  }
}
