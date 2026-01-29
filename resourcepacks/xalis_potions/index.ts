import { execute as generateItems } from "./vanilla/generateItems";
import { execute as generateModels } from "./vanilla/generateModels";
import { copyCustomFolder, execute as init } from "@lib/resourcepacks/setup";
import { config } from "./config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packRoot = dirname(fileURLToPath(import.meta.url));

await init(config);
await copyCustomFolder(config, join(packRoot, "public"));

generateItems();
generateModels();
