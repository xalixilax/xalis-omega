import type { CtmPropertiesBase } from "@lib/modded/ctm";
import type { BlockCategories, Namespace } from "./minecraft";

export type CtmBlockProperties = Record<string, CtmPropertiesBase[]>;

export type CtmPackGroup = {
    overlays: Set<string> | null;
    minecraft: CtmBlockProperties;
    modded?: Record<Namespace, CtmBlockProperties>;
};

export type CtmPacks = Record<keyof BlockCategories, CtmPackGroup>;