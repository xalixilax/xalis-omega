import { join } from "node:path";
import { config as localConfig } from "./resourcePack.config";
import { globalConfig } from "@global-config";
import type { Config } from "@lib/types/config";

// Merge configs with local taking precedence, global as fallback
export const config: Config = {
    ...localConfig,
    build: {
        output: join(globalConfig.output, localConfig.name),
    },
};
