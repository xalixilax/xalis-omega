import type { ResourcePack } from "@/types/TexturePack";

const packs: ResourcePack[] = [
  {
    slug: "enchanted-books",
    name: "Enchanted Books",
    group: "released",
    catchPhrase: "Magic never looked so good",
    shortDescription: "A resource pack that makes enchanted books look like they're actually enchanted.",
    description: "A resource pack that makes enchanted books look like they're actually enchanted. This pack is perfect for anyone who loves magic and wants to make their enchanted books look more magical.",
    links: {
      curseforge: "https://www.curseforge.com/minecraft/texture-packs/xalis-enchanted-books/files",
      github: "https://github.com/xalixilax/xali-s-Enchanted-Books-16x",
      modrinth: "https://modrinth.com/resourcepack/xalis-enchanted-books",
      pmc: "https://www.planetminecraft.com/texture-pack/xali-s-enchanted-books/",
      changelog: "https://raw.githubusercontent.com/xalixilax/xali-s-Enchanted-Books-16x/main/CHANGELOG.md",
    },
    tags: ["vanilla", "cit", "modded"],
    icon: "https://xalixilax.github.io/images/pack/enchanted_books.png",
    images: [
      "https://static.planetminecraft.com/files/image/minecraft/texture-pack/2021/325/14849946-v_l.webp",
    ],
    category: "enhancement"
  },
  {
    slug: "bushy-leaves",
    name: "Bushy Leaves",
    group: "released",
    catchPhrase: "Nature's Embrace in Every Pixel!",
    shortDescription: "A resource pack that makes leaves look more realistic and detailed.",
    description: "A resource pack that makes leaves look more realistic and detailed. This pack is perfect for anyone who loves nature and wants to make their Minecraft world look more beautiful.",
    links: {
      curseforge: "https://www.curseforge.com/minecraft/texture-packs/xalis-bushy-leaves",
      github: "https://github.com/xalixilax/xali-s-Bushy-Leaves",
    },
    tags: ["vanilla", "ctm", "modded"],
    icon: "",
    images: [
      "https://static.planetminecraft.com/files/image/minecraft/texture-pack/2021/588/15200360-pmc_l.webp",
    ],
    category: "enhancement"
  },
  {
    slug: "enhanced-jungle-wood",
    name: "Enhanced Jungle Wood",
    group: "released",
    catchPhrase: "The Jungle is Alive!",
    shortDescription: "This really simple pack replace jungle wood with a color matching the one of the noteblock.",
    description: `Note block are one of the block I love to use the most in build just because of the unique texture and color. Sadly, it is also hard to make it match with other block because of the unique color of that block. So just like fletching table matching birch or barrel matching spruce, I've made the noteblock match with the jungle wood.

But you know, since i don't really like the jungle wood, logs or planks, I decided to retexture it to match the color of the noteblock instead of doing the other way around. Quite a bit more work but I'm in love with the result. I hope you'll enjoy as much as I do!`,
    links: {
      curseforge: "https://www.curseforge.com/minecraft/texture-packs/xalis-enhanced-jungle-wood",
    },
    tags: ["vanilla", "modded", "ctm"],
    icon: "https://xalixilax.github.io/images/pack/jungle_wood.png",
    images: [],
    category: "reimagined"
  },
  {
    slug: "enhanced-vanilla",
    group: "released",
    name: "Enhanced Vanilla",
    catchPhrase: "Vanilla, but better!",
    shortDescription: "My biggest pack that aim to enhance the look of vanilla by adding overlays to blocks and fixing some textures.",
    description: "",
    links: undefined,
    tags: [],
    icon: "https://xalixilax.github.io/images/pack/enhanced-vanilla.png",
    images: [],
    category: "enhancement"
  },
  {
    slug: "enhanced-biome-river-pond",
    group: "released",
    name: "Enhanced Biome: River & Pond",
    catchPhrase: "Let the currents of realism flow through your game.",
    shortDescription: "This pack try to make the world react better with body of water.",
    description: "This pack aim to enhance water biome and environment with custom textures. Most of the change are small with huge impact on the appearance on the bodies of water. Enjoy!",
    links: undefined,
    tags: [],
    icon: "https://xalixilax.github.io/images/pack/enhanced_biome_river_and_pond.png",
    images: [],
    category: "enhancement"
  },
  {
    slug: "potions",
    group: "released",
    name: "Potions",
    catchPhrase: "Time to brew some magic!",
    shortDescription: "With this pack, you will get unique textures on every potions.",
    description: `One of my favorite texture pack along xali's enchanted books, it bring a different texture to every potion to make them easier to distinguish. This free version contain unique texture for regular splash and lingering potion. For my Patreon supporter, you can get the complete version which also contain unique texture for regular, strong and long potions of all type in addition to a unique texture for mundane, thick, awkward and uncraftable potion!

As always, enjoy!`,
    links: {
      curseforge: "https://www.curseforge.com/minecraft/texture-packs/xalis-potions",
    },
    tags: [],
    icon: "https://xalixilax.github.io/images/pack/enhanced_potions.png",
    images: [],
    category: "enhancement"
  },
  {
    slug: "framed-planks",
    group: "released",
    name: "Framed Planks",
    catchPhrase: "Frame your world with elegance!",
    shortDescription: "A small addon that replace double wooden slab with a unique texture.",
    description: "This texture pack basically adds a new block to the game with minimal impact with a minimal impact to vanilla. It will simply add a new texture to double slab (full block) without changing the functionality of single slabs or planks. This is the perfect pack to enhance your building!",
    links: {
      curseforge: "https://www.curseforge.com/minecraft/texture-packs/xalis-framed-planks",
    },
    tags: [],
    icon: "https://xalixilax.github.io/images/pack/framed_planks.png",
    images: [],
    category: "enhancement"
  },
];

export { packs };
