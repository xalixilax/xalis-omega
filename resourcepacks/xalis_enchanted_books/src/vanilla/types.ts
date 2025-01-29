export type StoredEnchantmentCase = {
  when: Record<string, number>;
  model: {
    type: "minecraft:model";
    model: string;
  };
};

export type StoredEnchantment = {
  type: "minecraft:select";
  property: "minecraft:component";
  component: "minecraft:stored_enchantments";
  cases: StoredEnchantmentCase[];
};
