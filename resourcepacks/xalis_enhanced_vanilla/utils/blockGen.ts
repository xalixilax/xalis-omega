import fs from "node:fs";
import path from "node:path";

/**
 * Generic blockstate/model generator.
 * A template is a pure function: given a block context (a material instance + namespace)
 * it returns the list of JSON files (blockstate + models) to write.
 */

export interface GenFile {
	/** Path relative to the resource pack root, e.g. "assets/minecraft/blockstates/oak_door.json" */
	path: string;
	json: unknown;
}

export interface BlockContext {
	/** Material/instance name, e.g. "oak" (produces oak_door) or "bricks" */
	name: string;
	/** Output namespace, e.g. "minecraft" */
	ns: string;
}

export type Template<Cfg = void> = (ctx: BlockContext, cfg: Cfg) => GenFile[];

export function renderJson(data: unknown): string {
	return JSON.stringify(data, null, "\t") + "\n";
}

export function writeGenFiles(root: string, files: GenFile[]): void {
	for (const file of files) {
		const outputPath = path.join(root, file.path);
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, renderJson(file.json));
	}
}
