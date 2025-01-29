type Config = {
  name: string;
  licenseUrl: string;
  pack: {
    pack_format: number;
    description: string;
  };
  page: {
    description: "page-description.md";
  };
  build: {
    output: string;
  };
};

export const config: Config = {
  name: "xali's enchanted books",
  licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
  pack: {
    pack_format: 49,
    description: "§6By xalixilax",
  },
  page: {
    description: "page-description.md",
  },
  build: {
    output:
      "/Users/xalix/Library/Application Support/PrismLauncher/instances/25w04a/minecraft/resourcepacks/release",
  },
};
