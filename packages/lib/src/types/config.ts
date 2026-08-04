type Config = {
  name: string;
  licenseUrl: string;
  pack: {
    pack: {
      pack_format: number;
      supported_formats?: [number, number] | { min_inclusive: number; max_inclusive: number };
      min_format?: number;
      max_format?: number;
      description: string;
    },
    overlays?: {
      entries: {
        directory: string;
        formats: {
          min_inclusive: number;
          max_inclusive: number
        };
        min_format?: number;
        max_format?: number;
      }[]
    }
  };
  page: {
    description: "page-description.md";
  };
  build: {
    output: string;
  };
};

export type PackConfig = Omit<Config, "build"> ;

export type { Config };

export const LATEST_PACK_FORMAT = 79