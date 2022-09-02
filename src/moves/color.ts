import { Color, Canvas } from "../types";
import { findBlock } from "../find-block";

export default function ColorMove({
  canvas,
  blockId,
  color
}: {
  canvas: Canvas;
  blockId: string;
  color: Color;
}) {
  const block = findBlock(canvas, blockId);
  if (block && "color" in block) {
    block.color = color;
  } else {
    if (!block) {
      console.error(`Block "${blockId}" not found`);
    } else {
      console.error(
        `Block "${blockId}" is not SimpleBlock. You can't color ComplexBlock`
      );
    }
  }
}
