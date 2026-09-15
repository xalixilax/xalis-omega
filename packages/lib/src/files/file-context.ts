import type { Files } from "./utils";


export interface FileContext {
    /** Material/instance name, e.g. "oak" (produces oak_door) or "bricks" */
    name: string;
    /** Output namespace, e.g. "minecraft" */
    ns: string;
}

export type Template<Cfg = void> = (ctx: FileContext, cfg: Cfg) => Files[];


export const minecraftBlock = ["a", "b"] as const;
export type MinecraftBlock = (typeof minecraftBlock)[number];