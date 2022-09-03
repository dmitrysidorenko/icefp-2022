import { Block, BlockId, MoveCommand, PCutMove, Point, SimpleBlock } from "../types";


export const PointCut: MoveCommand<{ blockId: BlockId, point: Point }> = ({
  blocks,
  blockId,
  point
}: {
  blocks: SimpleBlock[];
  blockId: string;
  point: Point;
}) => {
  return {
    blocks: blocks.reduce<SimpleBlock[]>((resultBlocks, block) => {
      if (block.id === blockId) {
        const isInside = isPointInsideBlock(block, point)
        if (isInside) {
          resultBlocks.push(
            ...PointCutBlock(block, point)
          )
          return resultBlocks
        }
      }
      resultBlocks.push(block)
      return resultBlocks
    }, []),
    moves: [makePointCutMove({ blockId, point })]
  }
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

export function makePointCutMove({
  blockId,
  point
}: {
  blockId: string;
  point: Point;
}): PCutMove {
  return ["cut", blockId, point]
}


export function isPointInsideBlock(block: Block, point: Point): boolean {
  const [p1, p2] = block.shape;
  const [x, y] = point;
  return x > p1[0] && x < p2[0] && y > p1[1] && y < p2[1];
}

export default PointCut