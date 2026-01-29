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

export const config: Config = {
	name: "xali's enhanced vanilla",
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
		"/Users/xalix/Library/Application Support/PrismLauncher/instances/1.21.5(1)/minecraft/resourcepacks/enhanced-vanilla-dev"
			//"/Users/xalix/Library/Application Support/PrismLauncher/instances/Fabulously Optimized/minecraft/resourcepacks/release",
		//"./dist",
	},
};
