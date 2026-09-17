#!/usr/bin/env bun
import { basename, dirname, join } from "node:path";
import { run } from "./build";

const packDir = process.cwd();
if (basename(dirname(packDir)) !== "resourcepacks") {
    console.error(`Run this from a resourcepacks/<pack> directory (got ${packDir})`);
    process.exit(1);
}

const bump = process.argv[2] ?? "patch";

const manifestPath = join(packDir, "package.json");
const original = await Bun.file(manifestPath).text();
const manifest = JSON.parse(original) as { name: string; version?: string };
if (!manifest.version) {
    throw new Error(`${manifestPath} has no version field`);
}

await run(["npm", "version", bump, "--no-git-tag-version", ...process.argv.slice(3)], packDir);
const version = ((await Bun.file(manifestPath).json()) as { version: string }).version;
const tag = `${manifest.name}/v${version}`;

const tagExists =
    Bun.spawnSync(["git", "rev-parse", "-q", "--verify", `refs/tags/${tag}`], {
        cwd: packDir,
        stdout: "ignore",
        stderr: "ignore",
    }).exitCode === 0;
if (tagExists) {
    await Bun.write(manifestPath, original);
    throw new Error(`Tag ${tag} already exists, package.json restored to ${manifest.version}`);
}

await run(["git", "add", "-A"], packDir);
await run(["git", "commit", "-m", `chore(release): ${manifest.name} v${version}`], packDir);
await run(["git", "tag", tag], packDir);
await run(["git", "push", "origin", "HEAD", `refs/tags/${tag}`], packDir);

console.log("");
console.log(`${manifest.name}: ${manifest.version} -> ${version}`);
console.log(`Tag ${tag} pushed. The release workflow will build and publish.`);
