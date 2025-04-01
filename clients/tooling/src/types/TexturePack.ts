export type ResourcePack = {
  slug: string;
  group: "released" | "wip";
  name: string;
  catchPhrase: string | undefined;
  shortDescription: string;
  description: string;
  links:
    | {
        curseforge?: string;
        github?: string;
        modrinth?: string;
        pmc?: string;
        changelog?: string;
      }
    | undefined;
  tags: Tags[];
  category: "reimagined" | "enhancement";
  icon: string;
  images: string[];
};

export type Tags = "vanilla" | "modded" | "ctm" | "cit" | "cem" | string;
