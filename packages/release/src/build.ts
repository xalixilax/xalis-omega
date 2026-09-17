import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

export async function run(args: string[], cwd: string): Promise<void> {
    const proc = Bun.spawn(args, { cwd, stdout: "inherit", stderr: "inherit" });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
        throw new Error(`Command failed (${exitCode}): ${args.join(" ")}`);
    }
}

export async function buildPack(repoRoot: string, packageName: string): Promise<void> {
    await run(["pnpm", "-F", packageName, "build"], repoRoot);
}

export async function zipDist(distDir: string, artifactName: string): Promise<string> {
    for (const entry of await readdir(distDir)) {
        if (entry.endsWith(".zip")) await unlink(join(distDir, entry));
    }
    await run(["zip", "-r", "-q", artifactName, "."], distDir);
    return join(distDir, artifactName);
}
