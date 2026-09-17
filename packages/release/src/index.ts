#!/usr/bin/env bun
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPack, zipDist } from "./build";
import { topSection, versionType } from "./changelog";
import { packs } from "./config";
import { publishCurseForge, publishModrinth } from "./publish";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const usage = "Usage: pnpm release <pack> [--publish[=modrinth,curseforge]] [--skip-build]";

const [packName, ...flags] = process.argv.slice(2);
const release = packName ? packs[packName] : undefined;
if (!release) {
    console.error(usage);
    console.error(`Packs: ${Object.keys(packs).join(", ")}`);
    process.exit(1);
}

const publishFlag = flags.find((flag) => flag === "--publish" || flag.startsWith("--publish="));
const skipBuild = flags.includes("--skip-build");
const targets = publishFlag?.includes("=")
    ? publishFlag.split("=")[1]!.split(",")
    : publishFlag
      ? ["modrinth", "curseforge"]
      : [];

const packDir = join(repoRoot, "resourcepacks", packName);
const manifest = (await Bun.file(join(packDir, "package.json")).json()) as { version?: string };
if (!manifest.version) {
    throw new Error(`${packName}/package.json has no version field`);
}
const version = manifest.version;

if (!skipBuild) {
    console.log(`Building ${packName}...`);
    await buildPack(repoRoot, packName);
}

const artifactPath = await zipDist(join(packDir, "dist"), `${release.displayName} v${version}.zip`);
const changelog = await readChangelog(packDir);

console.log("");
console.log(`Pack:      ${release.displayName}`);
console.log(`Version:   ${version} (${versionType(version)})`);
console.log(`Artifact:  ${artifactPath}`);
console.log(`Changelog: ${changelog?.split("\n")[0] ?? "(none)"}`);

if (!publishFlag) {
    console.log("\nDry run, nothing uploaded. Add --publish to upload.");
    process.exit(0);
}

console.log("");
for (const target of targets) {
    if (target === "modrinth") {
        if (!release.modrinth) {
            console.log("Modrinth: not configured, skipped");
            continue;
        }
        const id = await publishModrinth({ config: release, version, artifactPath, changelog: changelog ?? "" });
        console.log(`Modrinth: uploaded, version id ${id}`);
    } else if (target === "curseforge") {
        if (!release.curseforge) {
            console.log("CurseForge: not configured, skipped");
            continue;
        }
        const id = await publishCurseForge({ config: release, version, artifactPath, changelog: changelog ?? "" });
        console.log(`CurseForge: uploaded, file id ${id}`);
    } else {
        console.error(`Unknown target: ${target}`);
        process.exitCode = 1;
    }
}

async function readChangelog(packDir: string): Promise<string | null> {
    for (const file of ["CHANGELOG.md", "public/CHANGELOG.md"]) {
        const changelog = Bun.file(join(packDir, file));
        if (!(await changelog.exists())) continue;
        const section = topSection(await changelog.text());
        if (section) return section;
    }
    return null;
}
