#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { globalConfig } from "../configs";

const { minecraftVersion } = globalConfig;
const url = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/${minecraftVersion}/assets/minecraft/blockstates/_list.json`;

const response = await fetch(url);
if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${url}`);

const { files } = (await response.json()) as { files: string[] };
const blocks = files.map((file) => file.replace(/\.json$/, ""));

const outputDir = new URL("../packages/lib/src/minecraft/", import.meta.url).pathname;
await mkdir(outputDir, { recursive: true });
const outputFile = `${outputDir}blocks.ts`;

await Bun.write(
    outputFile,
    `/** Minecraft Version ${minecraftVersion} */
export const minecraftBlock = ${JSON.stringify(blocks)} as const;
export type MinecraftBlock = (typeof minecraftBlock)[number];
`
);

console.log(`${blocks.length} blocks saved to ${outputFile}`);
