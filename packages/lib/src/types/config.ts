type Config = {
  name: string;
  licenseUrl: string;
  pack: {
    pack_format: number;
    supported_formats?: [number, number];
    description: string;
  };
  page: {
    description: "page-description.md";
  };
  build: {
    output: string;
  };
};

export type { Config };
