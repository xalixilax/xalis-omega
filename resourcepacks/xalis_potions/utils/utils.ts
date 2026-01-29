export function longExcluded(potion: string) {
  // List of potions that should not have the long variant
  const excludedPotions = [
    // "mundane",
    // "thick",
    // "awkward",
    // "water",
    // "mundane_potion",
    "weakness", // This is a special case for the long variant of weakness
    "luck",
  ];

  return excludedPotions.includes(potion);
}

export function strongExcluded(potion: string) {
  // List of potions that should not have the strong variant
  const excludedPotions = [
    // "mundane",
    // "thick",
    // "awkward",
    // "water",
    // "mundane_potion",
    "luck",
    "weakness",
  ];

  return excludedPotions.includes(potion);
}

type PotionTypeKey = "p" | "s" | "l";
type PotionVariantKey = "l" | "s" | undefined;

const potionTypeSegment: Record<PotionTypeKey, string> = {
  p: "",
  s: "splash",
  l: "lingering",
};

const potionModifierSegment: Record<Exclude<PotionVariantKey, undefined>, string> = {
  l: "long",
  s: "strong",
};

export function getPotionAssetName(
  potion: string,
  type: PotionTypeKey,
  variant?: PotionVariantKey
) {
  const potionType = potionTypeSegment[type];
  const modifier = variant ? potionModifierSegment[variant] : "";
  const modifierPrefix = modifier ? `${modifier}_` : "";
  const typeSuffix = potionType ? `_${potionType}` : "";
  return `${modifierPrefix}${potion}${typeSuffix}_potion`;
}
