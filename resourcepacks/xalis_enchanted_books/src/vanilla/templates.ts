export function enchantedBookModelItemTemplate(enchantment: string, level: number, modName = "minecraft") {
  return {
    parent: "item/generated",
    textures: {
      layer0: `${modName}:item/${enchantment}_${level}`,
    },
  };
}