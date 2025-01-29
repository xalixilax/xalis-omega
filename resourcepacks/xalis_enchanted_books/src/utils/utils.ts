import path from "node:path";
import fs from "node:fs";

/**
 * Join the output folder while making sure it exists
 */
export function getOutputFolder(...paths: string[]) {
  const outputFolder = path.join(...paths);

  fs.mkdirSync(outputFolder, {
    recursive: true,
  });

  return outputFolder;
}

export function saveJsonToFile<T>(
  filePath: string,
  fileName: string,
  content: T
) {
  const outputFolder = path.join(filePath, fileName);

  Bun.write(outputFolder, JSON.stringify(content, null, 0));
}
