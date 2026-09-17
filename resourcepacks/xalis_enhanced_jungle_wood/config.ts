import { join } from "node:path";
import { config as localConfig } from "./resourcePack.config";
import { globalConfig } from "@global-config";
import type { Config } from "@lib/types/config";

export const config: Config = {
	...localConfig,
	build: {
		output: join(globalConfig.output, localConfig.name),
	},
};