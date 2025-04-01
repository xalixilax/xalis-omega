import type { Tile } from "@/types/Tile";
import React from "react";


type useCtmProps = {
  file: File;
  tiles: Record<number, Tile>;
  padding?: number;
  isInverted?: boolean;
};

export function useCtm({ file, tiles, padding = 4 }: useCtmProps) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [size, setSize] = React.useState<number>(16);

  React.useEffect(() => {
    const image = new Image();

    image.onload = () => {
      setImage(image);
      setSize(image.width);

      URL.revokeObjectURL(URL.createObjectURL(file));
    };

    image.src = URL.createObjectURL(file);
  }, [file]);

  function addZone(
    context: CanvasRenderingContext2D,
    xTile: number,
    yTile: number,
    id: number
  ) {
    const tile = tiles[id];

    const x = xTile * size;
    const y = yTile * size;

    if (!image) return;

    if (tile.sides) {
      if (tile.sides.includes("top")) {
        context.drawImage(image, 0, 0, size, padding, x, y, size, padding);
      }
      if (tile.sides.includes("bottom")) {
        context.drawImage(
          image,
          0,
          size - padding,
          size,
          padding,
          x,
          y + size - padding,
          size,
          padding
        );
      }
      if (tile.sides.includes("left")) {
        context.drawImage(image, 0, 0, padding, size, x, y, padding, size);
      }
      if (tile.sides.includes("right")) {
        context.drawImage(
          image,
          size - padding,
          0,
          padding,
          size,
          x + size - padding,
          y,
          padding,
          size
        );
      }

      if (tile.corners) {
        if (tile.corners.includes("top-left")) {
          context.drawImage(
            image,
            0,
            0,
            padding,
            padding,
            x,
            y,
            padding,
            padding
          );
        }
        if (tile.corners.includes("top-right")) {
          context.drawImage(
            image,
            size - padding,
            0,
            padding,
            padding,
            x + size - padding,
            y,
            padding,
            padding
          );
        }
        if (tile.corners.includes("bottom-left")) {
          context.drawImage(
            image,
            0,
            size - padding,
            padding,
            padding,
            x,
            y + size - padding,
            padding,
            padding
          );
        }
        if (tile.corners.includes("bottom-right")) {
          context.drawImage(
            image,
            size - padding,
            size - padding,
            padding,
            padding,
            x + size - padding,
            y + size - padding,
            padding,
            padding
          );
        }
      }
    }
  }

  function removeZone(
    context: CanvasRenderingContext2D,
    xTile: number,
    yTile: number,
    id: number
  ) {
    const tile = tiles[id];

    const x = xTile * size;
    const y = yTile * size;

    if (!image) return;

    context.drawImage(image, 0, 0, size, size, x, y, size, size);

    if (tile.sides) {
      if (tile.sides.includes("top")) {
        context.clearRect(x, y, size, padding);
      }
      if (tile.sides.includes("bottom")) {
        context.clearRect(x, y + size - padding, size, padding);
      }
      if (tile.sides.includes("left")) {
        context.clearRect(x, y, padding, size);
      }
      if (tile.sides.includes("right")) {
        context.clearRect(x + size - padding, y, padding, size);
      }
    }

    if (tile.corners) {
      if (tile.corners.includes("top-left")) {
        context.clearRect(x, y, padding, padding);
      }
      if (tile.corners.includes("top-right")) {
        context.clearRect(x + size - padding, y, padding, padding);
      }
      if (tile.corners.includes("bottom-left")) {
        context.clearRect(x, y + size - padding, padding, padding);
      }
      if (tile.corners.includes("bottom-right")) {
        context.clearRect(
          x + size - padding,
          y + size - padding,
          padding,
          padding
        );
      }
    }
  }

  return { addZone, removeZone, size, image };
}
