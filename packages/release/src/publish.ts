import { basename } from "node:path";
import { versionType } from "./changelog";
import type { PackReleaseConfig } from "./config";

type PublishOptions = {
    config: PackReleaseConfig;
    version: string;
    artifactPath: string;
    changelog: string;
};

export async function publishModrinth({ config, version, artifactPath, changelog }: PublishOptions): Promise<string> {
    if (!config.modrinth) throw new Error(`${config.displayName} has no Modrinth project id`);
    const token = process.env.MODRINTH_TOKEN;
    if (!token) throw new Error("MODRINTH_TOKEN is not set");

    const form = new FormData();
    form.append(
        "data",
        JSON.stringify({
            project_id: config.modrinth.projectId,
            name: `${config.displayName} v${version}`,
            version_number: version,
            changelog,
            game_versions: config.gameVersions,
            loaders: ["minecraft"],
            version_type: versionType(version),
            featured: false,
            status: "listed",
            dependencies: [],
            file_parts: ["file"],
            primary_file: "file",
        }),
    );
    form.append("file", Bun.file(artifactPath), basename(artifactPath));

    const response = await fetch("https://api.modrinth.com/v2/version", {
        method: "POST",
        headers: { Authorization: token },
        body: form,
    });
    if (!response.ok) {
        throw new Error(`Modrinth upload failed: ${response.status} ${await response.text()}`);
    }
    const created = (await response.json()) as { id: string };
    return created.id;
}

export async function publishCurseForge({ config, version, artifactPath, changelog }: PublishOptions): Promise<number> {
    if (!config.curseforge) throw new Error(`${config.displayName} has no CurseForge project id`);
    const token = process.env.CF_API_TOKEN;
    if (!token) throw new Error("CF_API_TOKEN is not set");

    const headers = { "X-Api-Token": token };
    const versionsResponse = await fetch("https://minecraft.curseforge.com/api/game/versions", { headers });
    if (!versionsResponse.ok) {
        throw new Error(`CurseForge game versions failed: ${versionsResponse.status} ${await versionsResponse.text()}`);
    }
    const available = (await versionsResponse.json()) as { id: number; name: string }[];

    const missing = config.gameVersions.filter((name) => !available.some((entry) => entry.name === name));
    if (missing.length > 0) {
        console.warn(`CurseForge: unknown game versions skipped: ${missing.join(", ")}`);
    }
    const gameVersions = config.gameVersions.flatMap(
        (name) => available.find((entry) => entry.name === name)?.id ?? [],
    );
    if (gameVersions.length === 0) {
        throw new Error(`CurseForge: no game versions matched (${config.gameVersions.join(", ")})`);
    }

    const form = new FormData();
    form.append(
        "metadata",
        JSON.stringify({
            changelog,
            changelogType: "markdown",
            displayName: `${config.displayName} v${version}`,
            gameVersions,
            releaseType: versionType(version),
        }),
    );
    form.append("file", Bun.file(artifactPath), basename(artifactPath));

    const response = await fetch(
        `https://minecraft.curseforge.com/api/projects/${config.curseforge.projectId}/upload-file`,
        { method: "POST", headers, body: form },
    );
    if (!response.ok) {
        throw new Error(`CurseForge upload failed: ${response.status} ${await response.text()}`);
    }
    const created = (await response.json()) as { id: number };
    return created.id;
}
