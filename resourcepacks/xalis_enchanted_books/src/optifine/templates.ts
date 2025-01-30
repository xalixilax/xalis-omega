export function citEnchantedBookFileTemplate(
  modName: string,
  enchantment: string,
  level: number,
  maxLevel?: number
) {
  const enchantmentLevels =
    level === maxLevel && level > 1 ? `${level}-${255}` : level;
  return `type=item
items=enchanted_book
texture=assets/minecraft/textures/item/${modName}/${enchantment}_${level}.png
enchantmentIDs=${modName}:${enchantment}
enchantmentLevels=${enchantmentLevels}`;
}
