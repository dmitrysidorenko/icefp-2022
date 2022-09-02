import { Block, Point, SimpleBlock } from "../types";

export default function PointCut({
  blocks,
  blockId,
  point
}: {
  blocks: SimpleBlock[];
  blockId: string;
  point: Point;
}) {
  const block = blocks.find(b => b.id === blockId);
  const rest = blocks.filter(b => b.id !== blockId);

  if (block && isPointInsideBlock(block, point)) {
    return [...rest, ...PointCutBlock(block, point)];
  }

  return rest;
}

export function PointCutBlock(block: SimpleBlock, [x, y]: Point): SimpleBlock[] {
  const [p1, p2] = block.shape;

  const newBlock1: SimpleBlock = {
    id: `${block.id}.0`,
    color: block.color,
    shape: [[...p1], [x, y]]
  };
  const newBlock2: SimpleBlock = {
    id: `${block.id}.1`,
    color: block.color,
    shape: [
      [x, p1[1]],
      [p2[0], y]
    ]
  };
  const newBlock3: SimpleBlock = {
    id: `${block.id}.1`,
    color: block.color,
    shape: [[x, y], [...p2]]
  };
  const newBlock4: SimpleBlock = {
    id: `${block.id}.1`,
    color: block.color,
    shape: [
      [p1[0], y],
      [x, p2[1]]
    ]
  };
  return [newBlock1, newBlock2, newBlock3, newBlock4];
}

function isPointInsideBlock(block: Block, point: Point): boolean {
  const [p1, p2] = block.shape;
  const [x, y] = point;
  return x > p1[0] && x < p2[0] && y > p1[1] && y < p2[1];
}

