import { fileURLToPath } from "node:url";
import { config as localConfig } from "./resourcePack.config";
import type { Config } from "@lib/types/config";

export const config: Config = {
    ...localConfig,
    build: {
        output: fileURLToPath(new URL("./dist", import.meta.url)),
    },
};
