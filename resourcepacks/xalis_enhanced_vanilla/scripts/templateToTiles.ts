import { createCanvas, loadImage } from "canvas";
import { readdir, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const INPUT_DIR = "./textures";
const OUTPUT_DIR = "./dist/assets/minecraft/optifine/ctm";

const GRID_WIDTH = 7;
const CELL_SIZE = 16;
const NOT_USED_CELLS = new Set([`${3},2`, `${4},2`, `${5},2`, `${6},2`]);

// Assure l'existence du dossier de sortie
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR);
}

// Fonction pour extraire nom du dossier et index depuis le nom du fichier
function parseFileName(
  fileName: string
): { folder: string; startIndex: number } | null {
  const lastUnderscore = fileName.lastIndexOf("_");
  if (lastUnderscore === -1) return null;

  const potentialNumber = fileName.slice(lastUnderscore + 1);
  const startIndex = parseInt(potentialNumber, 10);

  if (isNaN(startIndex)) return null;

  return {
    folder: fileName.slice(0, lastUnderscore), // Nom du dossier
    startIndex,
  };
}

// Fonction pour extraire et sauvegarder les textures individuelles
async function extractTextures(imagePath: string, fileName: string) {
  const parsed = parseFileName(fileName);
  if (!parsed) {
    console.warn(`❌ Format invalide : ${fileName}`);
    return;
  }

  const { folder, startIndex } = parsed;
  const folderPath = join(OUTPUT_DIR, folder);
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const img = await loadImage(imagePath);
  const canvas = createCanvas(CELL_SIZE, CELL_SIZE);
  const ctx = canvas.getContext("2d");

  let x = 0,
    y = 0,
    index = startIndex;

  while (index < startIndex + 17) {
    // Ignorer les cases "NOT USED"
    while (NOT_USED_CELLS.has(`${x},${y}`)) {
      x++;
      if (x >= GRID_WIDTH) {
        x = 0;
        y++;
      }
    }

    ctx.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    ctx.drawImage(img, x * -CELL_SIZE, y * -CELL_SIZE, img.width, img.height);

    const outputPath = join(folderPath, `${index}.png`);
    await writeFile(outputPath, canvas.toBuffer("image/png"));
    console.log(`✅ Extraite : ${outputPath}`);

    x++;
    if (x >= GRID_WIDTH) {
      x = 0;
      y++;
    }

    index++;
  }
}

// Exécuter le script sur toutes les images de `output/`
(async () => {
  const files = await readdir(INPUT_DIR);
  const pngFiles = files.filter((f) => f.endsWith(".png"));

  for (const file of pngFiles) {
    await extractTextures(join(INPUT_DIR, file), file);
  }
})();
