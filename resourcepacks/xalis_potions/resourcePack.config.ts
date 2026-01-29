import type { Config } from "@lib/types/config";

export const config: Config = {
  name: "xali's potions",
  licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
  pack: {
    "pack": {
      "pack_format": 15,
      "supported_formats": {
        "min_inclusive": 15,
        "max_inclusive": 64
      },
      "min_format": 15,
      "max_format": 75,
      "description": "Distinct potions that look kinda cool"
    },
    "overlays": {
      "entries": [
        {
          "directory": "components",
          "formats": {
            "min_inclusive": 32,
            "max_inclusive": 64
          }
        },
        {
          "directory": "1.21.5-",
          "formats": {
            "min_inclusive": 55,
            "max_inclusive": 75
          },
          "min_format": 55,
          "max_format": 75
        }
      ]
    }
  },

  page: {
    description: "page-description.md",
  },
  build: {
    // Removed output - will use global config as fallback
  },
};