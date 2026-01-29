import { potions, type Namespace, type Potion } from "../data/potions";
import { strongExcluded } from "../utils/utils";
import { longExcluded } from "../utils/utils";
import { getPotionAssetName } from "../utils/utils";
import { config } from "../config";

type Case = {
  when: { potion: string };
  model: { type: string; model: string };
};

function addCase(whenKey: string, modelPath: string, cases: Case[]) {
  cases.push({
    when: { potion: whenKey },
    model: { type: "minecraft:model", model: modelPath },
  });
}

function generateCases(potions: Namespace<Potion>, prefix: "p" | "l" | "s") {
  const cases: Case[] = [];

  //   addCase("minecraft:mundane", `minecraft:item/mundane/${prefix}`, cases);
  //   addCase("minecraft:thick", `minecraft:item/thick/${prefix}`, cases);
  //   addCase("minecraft:awkward", `minecraft:item/awkward/${prefix}`, cases);

  for (const { potion, long, strong } of potions.minecraft) {
    // Always add the base case (/${prefix}) if this effect exists in the input list at all
    addCase(
      `minecraft:${potion}`,
      `minecraft:item/${getPotionAssetName(potion, prefix)}`,
      cases
    );

    if (long && !longExcluded(potion)) {
      addCase(
        `minecraft:long_${potion}`,
        `minecraft:item/${getPotionAssetName(potion, prefix, "l")}`,
        cases
      );
    }

    if (strong && !strongExcluded(potion)) {
      addCase(
        `minecraft:strong_${potion}`,
        `minecraft:item/${getPotionAssetName(potion, prefix, "s")}`,
        cases
      );
    }
  }

  return cases;
}

async function writeToFile(cases: Case[], prefix: "p" | "l" | "s") {
  cases.sort((a, b) => a.when.potion.localeCompare(b.when.potion));

  const content = JSON.stringify(
    {
      model: {
        type: "minecraft:select",
        property: "minecraft:component",
        component: "minecraft:potion_contents",
        cases: cases,
        fallback: {
          type: "minecraft:model",
          model: `minecraft:item/${getPotionAssetName("water", prefix)}`,
        },
      },
    },
    null,
    2
  );
  const fileName = (() => {
    switch (prefix) {
      case "p":
        return "potion.json";
      case "l":
        return "lingering_potion.json";
      case "s":
        return "splash_potion.json";
      default:
        throw new Error(`Invalid prefix: ${prefix}`);
    }
  })();

  const filePath = `${config.build.output}/assets/minecraft/items/${fileName}`;

  await Bun.write(filePath, content);
  console.log(`Generated ${fileName} with ${cases.length} cases.`);
}

export function execute() {
  writeToFile(generateCases(potions, "p"), "p");
  writeToFile(generateCases(potions, "l"), "l");
  writeToFile(generateCases(potions, "s"), "s");
}
