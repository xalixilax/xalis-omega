import { LATEST_PACK_FORMAT, type Config, type PackConfig } from "@lib/types/config";

export const config: PackConfig = {
  name: "xali's potions",
  licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
  pack: {
    "pack": {
      "pack_format": 15,
      "supported_formats": {
        "min_inclusive": 15,
        "max_inclusive": LATEST_PACK_FORMAT
      },
      "min_format": 15,
      "max_format": LATEST_PACK_FORMAT,
      "description": "§6By xalixilax"
    },
    "overlays": {
      "entries": [
        {
          "directory": "32-64",
          "formats": {
            "min_inclusive": 32,
            "max_inclusive": 64
          }
        },
        {
          // replace models to use only one layer instead of the 2 used for previous versions
          "directory": "55",
          "formats": {
            "min_inclusive": 55,
            "max_inclusive": LATEST_PACK_FORMAT
          },
          "min_format": 55,
          "max_format": LATEST_PACK_FORMAT
        }
      ]
    }

  },
  page: {
    description: "page-description.md",
  },
};