type Config = {
  name: string;
  licenseUrl: string;
  pack: {
    pack_format: number;
    supported_formats?: [number,number];
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
    pack_format: 50,
    supported_formats: [4, 50],
    description: "§6By xalixilax",
  },
  page: {
    description: "page-description.md",
  },
  build: {
    output:
      "/Users/xalix/Library/Application Support/PrismLauncher/instances/1.21/.minecraft/resourcepacks/release",
  },
};