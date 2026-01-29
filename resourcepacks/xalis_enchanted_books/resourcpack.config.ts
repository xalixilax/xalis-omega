
import type { Config } from "@lib/src/types/config";

export const config: Config = {
	name: "xali's enchanted books",
	licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
	pack: {
		pack_format: 71,
		supported_formats: [4, 71],
		description: "§6By xalixilax",
	},
	page: {
		description: "page-description.md",
	},
	build: {
		output:
			//"/Users/xalix/Library/Application Support/PrismLauncher/instances/1.21/.minecraft/resourcepacks/release",
			//"./dist",
			"/Users/xalix/Library/Application Support/PrismLauncher/instances/1.21.1/minecraft/resourcepacks/books",
	},
};