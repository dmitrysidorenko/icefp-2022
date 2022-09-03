import { Point, Orientation, SimpleBlock, Block, MoveCommand, BlockId, LCutMove } from "../types";

const LineCut: MoveCommand<{ blockId: BlockId, orientation: Orientation, point: Point }> = ({
  blocks,
  blockId,
  orientation,
  point: [x, y]
}: {
  blocks: Block[];
  blockId: string;
  orientation: Orientation;
  point: Point;
}) => {
  return {
    blocks: blocks.reduce<SimpleBlock[]>((resultBlocks, block) => {
      if (block.id === blockId) {
        // check is point is inside block
        const [p1, p2] = block.shape;
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
          resultBlocks.push(newBlock1, newBlock2)
          return resultBlocks
        }
      }
      resultBlocks.push(block)
      return resultBlocks
    }, []),
    moves: [makeLineCutMove({
      blockId, orientation, point: [x, y]
    })]
  }
}

export function makeLineCutMove({
  blockId,
  orientation,
  point: [x, y] }: {
    blockId: string;
    orientation: Orientation;
    point: Point;
  }): LCutMove {
  return ["cut", blockId, [orientation], orientation === 'vertical' ? [x] : [y]]
}

export default LineCut