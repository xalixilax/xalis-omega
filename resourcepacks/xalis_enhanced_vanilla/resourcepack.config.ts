import { fileURLToPath } from "node:url";

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
	optimize: boolean;
};

export const config: Config = {
	name: "xali's enhanced vanilla",
	licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
	pack: {
		pack_format: 71,
		supported_formats: [34, 71],
		description: "§6By xalixilax",
	},
	page: {
		description: "page-description.md",
	},
	build: {
		output: fileURLToPath(new URL("./dist", import.meta.url)),
	},
	optimize: true,
};
