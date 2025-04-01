import { useCtm } from "@/hooks/useCtm";
import type { Tile } from "@/types/Tile";
import React from "react";
import { useRef } from "react";
import { exportTileMap } from "@/lib/canvas";

export function CtmFromTile({
  file,
  tiles,
  x,
  y,
  padding = 4,
  isInverted = false,
}: {
  file: File;
  tiles: Record<number, Tile>;
  x: number;
  y: number;
  padding?: number;
  isInverted?: boolean;
}) {
  const { addZone, removeZone, size, image } = useCtm({
    file,
    tiles,
    padding,
    isInverted,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  React.useEffect(() => {
    function draw(context: CanvasRenderingContext2D) {
      if (!image) return;

      if (context) {
        let idx = 0;

        if (image) {
          for (let i = 0; i < y; i++) {
            for (let j = 0; j < x; j++, idx++) {
              if (isInverted) {
                removeZone(context, j, i, idx);
              } else {
                addZone(context, j, i, idx);
              }
            }
          }
        }
        frameRef.current = requestAnimationFrame(() => draw(context));
      }
    }

    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (context) {
        context.canvas.height = size * y;
        context.canvas.width = size * x;

        frameRef.current = requestAnimationFrame(() => draw(context));
      }
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [image, size, isInverted, padding, addZone, removeZone, x, y]);

  return (
    <div>
      <canvas ref={canvasRef} />
      <button
        type="button"
        onClick={() => {
          if (canvasRef.current) {
            exportTileMap(canvasRef as React.RefObject<HTMLCanvasElement>, x, y, Object.keys(tiles).length);
          } else {
            console.error("Canvas element is not available.");
          }
        }}
      >
        test
      </button>
    </div>
  );
}
