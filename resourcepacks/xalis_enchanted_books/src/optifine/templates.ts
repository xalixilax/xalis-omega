export function citEnchantedBookFileTemplate(
  modName: string,
  enchantment: string,
  level: number
) {
  return `type=item
items=enchanted_book
texture=assets/minecraft/textures/item/${modName}/${enchantment}_${level}.png
enchantmentIDs=${modName}:${enchantment}
enchantmentLevels=${level}`;
}
