export type EnchantedBook = {
  enchantment: string;
  maxLevel?: number;
  range?: Range[];
};

export type EnchantedBookList = {
  [key: string]: EnchantedBook[];
};

export type Range = `${number}-${number}`;

export const enchantedBooks: EnchantedBookList = {
  minecraft: [
    { enchantment: "aqua_affinity" },
    { enchantment: "bane_of_arthropods", maxLevel: 5 },
    { enchantment: "breach", maxLevel: 4 },
    { enchantment: "blast_protection", maxLevel: 4 },
    { enchantment: "channeling" },
    { enchantment: "binding_curse" },
    { enchantment: "density", maxLevel: 5 },
    { enchantment: "depth_strider", maxLevel: 3 },
    { enchantment: "efficiency", maxLevel: 5 },
    { enchantment: "feather_falling", maxLevel: 4 },
    { enchantment: "fire_aspect", maxLevel: 2 },
    { enchantment: "fire_protection", maxLevel: 4 },
    { enchantment: "flame" },
    { enchantment: "fortune", maxLevel: 3 },
    { enchantment: "frost_walker", maxLevel: 2 },
    { enchantment: "impaling", maxLevel: 5 },
    { enchantment: "infinity" },
    { enchantment: "knockback", maxLevel: 2 },
    { enchantment: "looting", maxLevel: 3 },
    { enchantment: "loyalty", maxLevel: 3 },
    { enchantment: "luck_of_the_sea", maxLevel: 3 },
    { enchantment: "lure", maxLevel: 3 },
    { enchantment: "mending" },
    { enchantment: "multishot" },
    { enchantment: "piercing", maxLevel: 5 },
    { enchantment: "power", maxLevel: 5 },
    { enchantment: "projectile_protection", maxLevel: 4 },
    { enchantment: "protection", maxLevel: 4 },
    { enchantment: "punch", maxLevel: 2 },
    { enchantment: "quick_charge", maxLevel: 3 },
    { enchantment: "respiration", maxLevel: 3 },
    { enchantment: "riptide", maxLevel: 3 },
    { enchantment: "sharpness", maxLevel: 5 },
    { enchantment: "silk_touch" },
    { enchantment: "smite", maxLevel: 5 },
    { enchantment: "soul_speed", maxLevel: 3 },
    { enchantment: "sweeping_edge", maxLevel: 3 },
    { enchantment: "swift_sneak", maxLevel: 3 },
    { enchantment: "thorns", maxLevel: 3 },
    { enchantment: "vanishing_curse" },
    { enchantment: "unbreaking", maxLevel: 3 },
    { enchantment: "wind_burst", maxLevel: 3 },
  ],
  illager_plus: [
    { enchantment: "illager_bane", maxLevel: 6, range: ["7-100"] },
  ],
  alexsmobs: [
    { enchantment: "straddle_jump", maxLevel: 3 },
    { enchantment: "board_return" },
    { enchantment: "serpentfriend" },
    { enchantment: "lavawax" },
  ],
  betterendforge: [{ enchantment: "end_veil" }],
  astralsorcery: [
    { enchantment: "scorching_heat" },
    { enchantment: "night_vision" },
  ],
  enchantedshulkers: [{ enchantment: "refill" }, { enchantment: "siphon" }],
  charm: [{ enchantment: "acquisition" }],
  veinmining: [{ enchantment: "vein_mining" }],
};
