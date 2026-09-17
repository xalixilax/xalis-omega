import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { copyCustomFolder, execute as init } from "@lib/minecraft/setup";
import { config } from "./config";
import { generate } from "./generate";

const packRoot = dirname(fileURLToPath(import.meta.url));

await init(config);
await copyCustomFolder(config, join(packRoot, "public"));

await generate();