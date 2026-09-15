import fs from "node:fs";
import path from "node:path";

export interface Files {
	/** Path relative to the resource pack root, e.g. "assets/minecraft/blockstates/oak_door.json" */
	path: string;
	content: unknown;
}

export function renderJson(data: unknown, optimize: boolean = true): string {
	return optimize ? JSON.stringify(data) : JSON.stringify(data, null, "\t") + "\n";
}

export function safeWriteFile(root: string, file: Files, optimize?: boolean): void {
	const outputPath = path.join(root, file.path);
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, renderJson(file.content, optimize));
}

export function safeWriteFiles(root: string, files: Files[], optimize?: boolean): void {
	for (const file of files) {
		const outputPath = path.join(root, file.path);
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, renderJson(file.content, optimize));
	}
}
