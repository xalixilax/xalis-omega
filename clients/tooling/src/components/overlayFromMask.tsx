import {
  canvasContext2d,
  exportTileMap,
  handlePngInputFileChange,
} from "@/lib/canvas";
import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function OverlayFromMask() {
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [resultImage, setResultImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [{ height, width }, setSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error("Canvas element not found");
    }
    const ctx = canvasContext2d(canvasRef as React.RefObject<HTMLCanvasElement>);

    ctx.canvas.height = height * 3;
    ctx.canvas.width = width * 7;

    if (backgroundImage && maskImage) {
      // Clear the canvas
      ctx.clearRect(0, 0, width * 3, height * 7);

      // Apply mask
      ctx.drawImage(maskImage, 0, 0);

      ctx.globalCompositeOperation = "source-atop";

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
          console.log(
            backgroundImage,
            0,
            0,
            width,
            height,
            j * width,
            i * height,
            width,
            height
          );

          ctx.drawImage(backgroundImage, j * width, i * height);

          const image = new Image();
          image.src = canvasRef.current?.toDataURL() as string;
          setResultImage(image);
        }
      }

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
    }
  }, [backgroundImage, maskImage, width, height]);

  return (
    <div>
      <h1>Image Uploader</h1>
      <h2>Background Image</h2>
      <Input
        type="file"
        onChange={(e) =>
          handlePngInputFileChange(e, (image) => {
            setBackgroundImage(image);
            setSize({
              width: image.width,
              height: image.height,
            });
          })
        }
        accept="image/png"
      />
      {backgroundImage?.src && (
        <img
          src={backgroundImage?.src}
          alt="Background"
          className="pixelated w-64 h-64"
        />
      )}
      <h2>Mask Image</h2>
      <Input
        type="file"
        onChange={(e) => handlePngInputFileChange(e, setMaskImage)}
        accept="image/png"
      />
      <canvas ref={canvasRef} />
      {resultImage?.src && (
        <img
          src={resultImage?.src}
          alt="Background"
          className="pixelated w-[100%]"
        />
      )}
      <Button onClick={() => exportTileMap(canvasRef as React.RefObject<HTMLCanvasElement>, 7, 3, 17)}>
        Download
      </Button>
    </div>
  );
}
