import { Canvas, Point, Orientation, SimpleBlock } from "../types";
import { findBlockWithParent } from "../find-block";

export default function LineCut({
  canvas,
  blockId,
  orientation,
  point: [x, y]
}: {
  canvas: Canvas;
  blockId: string;
  orientation: Orientation;
  point: Point;
}) {
  const searchResult = findBlockWithParent(canvas, blockId);
  if (!searchResult) {
    console.error(`Block "${blockId}" not found`);
    return;
  }
  const [block, parent] = searchResult;
  if ("color" in block) {
    const [p1, p2] = block.shape;
    // check is point is inside block
    const isPointInsideBlock = x > p1[0] && x < p2[0] && y > p1[1] && y < p2[1];
    if (isPointInsideBlock) {
      const newBlock1: SimpleBlock = {
        id: `${block.id}.0`,
        color: block.color,
        shape: [[...p1], orientation === "vertical" ? [x, p2[1]] : [p2[0], y]]
      };
      const newBlock2: SimpleBlock = {
        id: `${block.id}.1`,
        color: block.color,
        shape: [orientation === "vertical" ? [x, p1[1]] : [p1[0], y], [...p2]]
      };
      parent.children = parent.children.map((b) =>
        b === block
          ? {
              id: block.id,
              shape: block.shape,
              children: [newBlock1, newBlock2]
            }
          : b
      );
    } else {
      console.error("Point should be inside block");
    }
  } else {
    console.error(
      `Block "${blockId}" is not SimpleBlock. You can't cut ComplexBlock`
    );
  }
}
