import JSZip from "jszip";
import FileSaver from "file-saver";

export function canvasContext2d(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current;

  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  return ctx;
}

export function exportTileMap(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  x: number,
  y: number,
  tileCount: number
): void {
  const canvas = canvasRef.current;

  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const { width, height } = {
    width: canvas.width / x,
    height: canvas.height / y,
  };

  const zip = new JSZip();

  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = width;
  tileCanvas.height = height;
  const tileCtx = tileCanvas.getContext("2d");

  if (!tileCtx) {
    throw new Error("Could not get 2D context from tile canvas");
  }

  let idx = 0;

  for (let i = 0; i < y; i++) {
    for (let j = 0; j < x; j++, idx++) {
      if (idx >= tileCount) {
        break;
      }

      tileCtx.clearRect(0, 0, width, height);
      tileCtx.drawImage(
        canvas,
        j * width,
        i * height,
        width,
        height,
        0,
        0,
        width,
        height
      );

      const dataUrl = tileCanvas.toDataURL("image/png");

      const byteString = atob(dataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/png" });

      zip.file(`${i * x + j}.png`, blob);
    }
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    FileSaver.saveAs(blob, "tiles.zip");
  });
}

export function handlePngInputFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  handleChange: (image: HTMLImageElement) => void
) {
  if (!e.target.files) return;

  const file = e.target.files[0];

  const image = new Image();

  image.onload = () => {
    handleChange(image);

    URL.revokeObjectURL(URL.createObjectURL(file));
  };

  image.src = URL.createObjectURL(file);
}
