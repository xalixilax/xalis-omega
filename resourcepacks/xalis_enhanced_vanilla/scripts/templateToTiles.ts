import { join } from "node:path";
import { splitOverlayTemplate } from "../utils/canvas";

const OUTPUT_DIR = "./dist/assets/minecraft/optifine/ctm";

// // Assure l'existence du dossier de sortie
// if (!existsSync(OUTPUT_DIR)) {
//   mkdirSync(OUTPUT_DIR);
// }

/**
 * Get the start index from an png file name.
 * 
 * Example:
 * stone_bricks_20.png => 20
 * 
 * @param fileName Name of the file
 * @returns Index that should be used as the start index
 */
function getStartIndex(
	fileName: string,
) {
	const match = fileName.match(/(\d+)\.png/);
  return match ? Number.parseInt(match[0]) : undefined;
}

/**
 *
 * @param input
 * @param fileName
 * @param output
 * @returns
 */
export async function extractTextures(
	input: string,
	fileName: string,
	output: string,
) {
	const startIndex = getStartIndex(fileName);

	if (startIndex === undefined) {
		console.warn(`❌ Format invalide : ${fileName}`);
		return;
	}

	//const folderPath = join(OUTPUT_DIR, output);

	await splitOverlayTemplate(input, output, { startIndex });
}




