import { join } from "node:path";
import type { Config } from "@lib/types/config";
import fs from "node:fs";

export function generateMcmeta(config: Config) {
  const content = JSON.stringify({ pack: config.pack }, null, 2);

  const path = join(config.build.output, "pack.mcmeta");
  Bun.write(path, content);
}

export async function generateLicense(config: Config) {
  const response = await fetch(config.licenseUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const path = join(config.build.output, "LICENSE");
  Bun.write(path, await response.text());
}

export async function copyReadme(config: Config) {
  const file = Bun.file("public/README.md");

  if (!file.exists()) {
    return;
  }

  const path = join(config.build.output, "README.md");
  Bun.write(path, file);
}

export function copyChangelogs(config: Config) {
  const file = Bun.file("public/CHANGELOG.md");

  if (!file.exists()) {
    return;
  }

  const path = join(config.build.output, "CHANGELOG.md");
  Bun.write(path, file);
}

export function copyIcon(config: Config) {
  const file = Bun.file("public/pack.png");

  if (!file.exists()) {
    return;
  }

  const path = join(config.build.output, "pack.png");
  Bun.write(path, file);
}

export async function copyCustomFolder(config: Config, folder: string) {
  if (!fs.existsSync(folder)) {
    return;
  }
  fs.cpSync(folder, config.build.output, { recursive: true });
}

export async function execute(config: Config) {
  generateMcmeta(config);
  generateLicense(config);
  copyCustomFolder(config, "public");
}