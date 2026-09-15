function flattenMinecraftBlocks(input: unknown): Set<string> {
	const result = new Set<string>();

	function recurse(value: unknown): void {
		if (typeof value === "string") {
			result.add(value);
		} else if (Array.isArray(value)) {
			for (const item of value) {
				recurse(item);
			}
		} else if (typeof value === "object" && value !== null) {
			for (const key in value as Record<string, unknown>) {
				recurse((value as Record<string, unknown>)[key]);
			}
		}
	}

	recurse(input);
	return result;
}


export function flattenMinecraftBlocksArgs(...inputs: unknown[]): Set<string> {
	let result = new Set<string>();

	for (const input of inputs) {
		if (typeof input === "string") {
			result.add(input);
		} else if (Array.isArray(input)) {
			result = new Set([...result, ...flattenMinecraftBlocks(input)])
		} else if (typeof input === "object" && input !== null) {
			result = new Set([...result, ...flattenMinecraftBlocks(input)])
		}
	}

	return result;
}