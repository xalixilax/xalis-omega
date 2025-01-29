import fs from "node:fs";
import { join, parse } from "node:path";
import { createCanvas, Image } from "canvas";
import { getOutputFolder } from "./utils";

/**
 * Splits each texture in a folder into individual 16x16 images without external libraries.
 */
export async function splitHorizontalTilemap(
  inputFolder: string,
  baseDir: string
) {
  const outputFolder = getOutputFolder(
    baseDir,
    "assets/minecraft/textures/item"
  );

  // Read all PNG files in the input folder
  const files = fs
    .readdirSync(inputFolder)
    .filter((file) => file.endsWith(".png"));

  for (const file of files) {
    const filePath = join(inputFolder, file);
    const imageData = fs.readFileSync(filePath);

    const image = new Image();
    image.src = imageData;

    const numTextures = image.width / 16; // Number of 16x16 textures

    for (let i = 0; i < numTextures; i++) {
      // Create a new canvas
      const canvas = createCanvas(16, 16);
      const ctx = canvas.getContext("2d");

      // Draw a cropped section from the original image
      ctx.drawImage(image, i * 16, 0, 16, 16, 0, 0, 16, 16);

      // Save the cropped image
      const buffer = canvas.toBuffer("image/png") as unknown as string

      const outputFilePath = join(
        outputFolder,
        `${parse(file).name}_${i + 1}.png`
      );
      fs.writeFileSync(outputFilePath, buffer);
    }
  }
}
