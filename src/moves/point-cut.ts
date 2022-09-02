import { Block, Point, SimpleBlock } from "../types";
import LineCut from "./line-cut";

export default function PointCut({
  blocks,
  blockId,
  point
}: {
  blocks: SimpleBlock[];
  blockId: string;
  point: Point;
}) {
  return blocks.reduce<SimpleBlock[]>((resultBlocks, block) => {
    if (block.id === blockId) {
      // check is point is inside block
      const [p1, p2] = block.shape;
      const isInside = isPointInsideBlock(block, point)
      if (isInside) {
        const newBlock1: SimpleBlock = {
          id: `${block.id}.0`,
          color: block.color,
          shape: [[...p1], [...point]]
        };
        const newBlock2: SimpleBlock = {
          id: `${block.id}.1`,
          color: block.color,
          shape: [[point[0], p1[1]], [p2[0], point[1]]]
        };
        const newBlock3: SimpleBlock = {
          id: `${block.id}.2`,
          color: block.color,
          shape: [[...point], [...p2]]
        };
        // const newBlock4: SimpleBlock = {
        //   id: `${block.id}.3`,
        //   color: block.color,
        //   shape: [[p1[0], point[1]], [point[0], p2[1]]]
        // };
        resultBlocks.push(
          newBlock1,
          // newBlock2,
          // newBlock3,
          // newBlock4
          )
        return resultBlocks
      }
    }
    resultBlocks.push(block)
    return resultBlocks
  }, [])
}

export function PointCut2({
  blocks,
  blockId,
  point
}: {
  blocks: SimpleBlock[];
  blockId: string;
  point: Point;
}) {
  return LineCut({
    blocks: LineCut({
      blocks: LineCut({ blocks, blockId, orientation: 'horizontal', point }),
      point,
      orientation: 'vertical',
      blockId: `${blockId}.0`
    }),
    point,
    orientation: 'vertical',
    blockId: `${blockId}.1`

  })
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
    id: `${block.id}.2`,
    color: block.color,
    shape: [[x, y], [...p2]]
  };
  const newBlock4: SimpleBlock = {
    id: `${block.id}.3`,
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

