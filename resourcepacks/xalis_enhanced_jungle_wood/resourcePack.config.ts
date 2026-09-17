import { LATEST_PACK_FORMAT, type PackConfig } from "@lib/types/config";

export const config: PackConfig = {
	name: "xali's enhanced jungle wood",
	licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt",
	pack: {
		pack: {
			pack_format: LATEST_PACK_FORMAT,
			supported_formats: {
				min_inclusive: 15,
				max_inclusive: LATEST_PACK_FORMAT,
			},
			description: "§6By xalixilax",
		},
	},
	page: {
		description: "page-description.md",
	},
};