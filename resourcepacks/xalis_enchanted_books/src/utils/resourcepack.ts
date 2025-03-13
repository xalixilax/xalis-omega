import { join } from "node:path";
import { config } from "../../resourcpack.config";

const content = JSON.stringify({ pack: config.pack }, null, 2);

export function generateMcmeta(baseDir: string) {
  const path = join(baseDir, "pack.mcmeta");
  Bun.write(path, content);
}

export async function generateLicense(baseDir: string) {
  const response = await fetch(config.licenseUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const path = join(baseDir, "LICENSE");
  Bun.write(path, await response.text());
}

export async function copyReadme(baseDir: string) {
  const file = Bun.file("README.md");

  if (!file.exists()) {
    return;
  }
  
  const path = join(baseDir, "README.md");
  Bun.write(path, file);
}

export function copyChangelogs(baseDir: string) {
  const file = Bun.file("CHANGELOG.md");

  if (!file.exists()) {
    return;
  }

  const path = join(baseDir, "CHANGELOG.md");
  Bun.write(path, file);
}

export function copyIcon(baseDir: string) {
  const file = Bun.file("pack.png");

  if (!file.exists()) {
    return;
  }

  const path = join(baseDir, "pack.png");
  Bun.write(path, file);
}
