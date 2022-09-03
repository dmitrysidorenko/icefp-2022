import { Block, BlockId, Move, MoveCommand, MoveCommandResult, PCutMove, Point, Shape, SimpleBlock } from "../types";


export const PointCut: MoveCommand<{ blockId: BlockId, point: Point }> = ({
  blocks,
  blockId,
  point
}: {
  blocks: SimpleBlock[];
  blockId: string;
  point: Point;
}) => {
  return blocks.reduce<MoveCommandResult>((acc, block) => {
    if (block.id === blockId) {
      const isInside = isPointInsideBlock(block, point)
      if (isInside) {
        const { blocks: newBlocks, moves } = PointCutBlock(block, point)
        acc.blocks.push(
          ...newBlocks
        )
        acc.moves.push(...moves)
        return acc
      }
    }
    acc.blocks.push(block)
    return acc
  }, { blocks: [...blocks], moves: [] })
}

export function PointCutBlock(block: Block, [x, y]: Point): { blocks: Block[]; moves: Move[] } {
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
  return {
    blocks: [newBlock1, newBlock2, newBlock3, newBlock4],
    moves: [makePointCutMove({ blockId: block.id, point: [x, y], shape: [[...p1], [...p2]] })]
  };
}

export function makePointCutMove({
  blockId,
  point,
  shape
}: {
  blockId: string;
  point: Point;
  shape: Shape
}): PCutMove {
  return { name: "pcut", blockId, point, blockShape: shape }
}


export function isPointInsideBlock(block: Block, point: Point): boolean {
  const [p1, p2] = block.shape;
  const [x, y] = point;
  return x > p1[0] && x < p2[0] && y > p1[1] && y < p2[1];
}

export default PointCut