import { homedir } from "node:os";
import { join } from "node:path";

export const globalConfig = {
    output: "/Users/xalix/Library/Application Support/PrismLauncher/instances/26.2/minecraft/resourcepacks",
    // join(
    //     homedir(),
    //     process.platform === "linux"
    //         ? "Library/Application Support/PrismLauncher/instances"
    //         : ".local/share/PrismLauncher/instances",
    //     "26.2",
    //     "minecraft/resourcepacks",
    // ),
    optimize: true,
    minecraftVersion: "26.2",
}

// '/Users/xalix/Library/Application Support/PrismLauncher/instances/26.2/minecraft/resourcepacks'