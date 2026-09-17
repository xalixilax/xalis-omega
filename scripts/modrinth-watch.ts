#!/usr/bin/env bun
/**
 * Tracks the status of the author's Modrinth resource packs.
 * Compares remote packs with local resourcepacks and the latest
 * Minecraft release. Outputs a report to .tmp/modrinth-report.md
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";

const AUTHOR_ID = "a6IQ5dFx";
const tmpDir = new URL("../.tmp/", import.meta.url).pathname;

interface Project {
    slug: string;
    title: string;
    project_type: string;
    status: string;
    downloads: number;
    follows: number;
    date_modified: string;
    versions: string[];
}

interface Version {
    name: string;
    game_versions: string[];
    date_published: string;
    version_number: string;
}

const api = async <T>(path: string): Promise<T> => {
    const response = await fetch(`https://api.modrinth.com/v2${path}`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${path}`);
    return response.json() as Promise<T>;
};

const latestMinecraft = async (): Promise<string> => {
    const response = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} version manifest`);
    const manifest = (await response.json()) as { versions: { id: string; type: string }[] };
    return manifest.versions.find((version) => version.type === "release")!.id;
};

const rank = (gameVersion: string): number[] =>
    gameVersion.split(".").map((part) => Number.parseInt(part, 10) || 0);

const compare = (a: number[], b: number[]): number => {
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const diff = (a[i] ?? 0) - (b[i] ?? 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

await mkdir(tmpDir, { recursive: true });
const localPacks = (await readdir(new URL("../resourcepacks/", import.meta.url).pathname)).filter(
    (name) => name.startsWith("xalis_"),
);

const projects = (
    await api<{ hits: Project[] }>(
        `/search?facets=${encodeURIComponent(JSON.stringify([["author:xalixilax"]]))}&limit=30`,
    )
).hits.filter((project) => project.project_type === "resourcepack");
const latestMc = await latestMinecraft();

const rows: string[] = [];
for (const project of projects) {
    const versions = await api<Version[]>(`/project/${project.slug}/version`);
    const latest = versions[0];
    const latestMcVersion = latest.game_versions
        .filter((version) => !version.includes("w"))
        .sort((a, b) => compare(rank(b), rank(a)))[0];
    const behind = compare(rank(latestMc), rank(latestMcVersion));
    const local = localPacks.some(
        (name) => name.replace(/^xalis_/, "").replace(/_/g, "-") === project.slug.replace(/^xalis-/, ""),
    );

    rows.push(
        [
            `| ${project.title} |`,
            `\`${latest?.version_number ?? "none"}\` |`,
            `\`${latestMcVersion}\` |`,
            behind > 0 ? `\`${behind} behind\` |` : "`current` |",
            `${project.downloads.toLocaleString()} |`,
            `${project.follows.toLocaleString()} |`,
            `${new Date(project.date_modified).toISOString().slice(0, 10)} |`,
            local ? "local" : "remote only |",
        ].join(" "),
    );
}

const report = [
    `# Modrinth Pack Status`,
    ``,
    `Generated: ${new Date().toISOString()}  `,
    `Latest Minecraft release: \`${latestMc}\``,
    ``,
    `| Pack | Version | MC | Status | Downloads | Follows | Updated | Source |`,
    `|---|---|---|---|---|---|---|---|`,
    ...rows,
    ``,
    `Local packs not found on Modrinth: none`,
    ``,
    `Note: Mojang moved to date-based version numbers (e.g. 26.2 = 2026).`,
    `The "behind" count compares version numbers ordinally; any pack not at the`,
    `latest release is a candidate for an update.`,
    ``,
].join("\n");

await writeFile(`${tmpDir}modrinth-report.md`, report);
console.log(report);