import { moveCost } from "../cost";
import { Point, Orientation, SimpleBlock, Block, MoveCommand, BlockId, LCutMove, Shape, MoveCommandResult } from "../types";

const LineCut: MoveCommand<{ blockId: BlockId, orientation: Orientation, point: Point }> = ({
  blocks,
  blockId,
  orientation,
  point: [x, y]
}) => {
  return blocks.reduce<MoveCommandResult>((resultBlocks, block) => {
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
        resultBlocks.blocks.push(newBlock1, newBlock2)
        resultBlocks.moves.push(makeLineCutMove({
          blockId, orientation, point: [x, y], shape: [[...p1], [...p2]]
        }))
        resultBlocks.cost += moveCost("lcut", block, {width: 400, height: 400});
        return resultBlocks
      }
    }
    resultBlocks.blocks.push(block)
    return resultBlocks
  }, { blocks: [], moves: [], cost: 0 })
}

export function makeLineCutMove({
  blockId,
  orientation,
  point: [x, y],
  shape
}: {
  blockId: string;
  orientation: Orientation;
  point: Point
  shape: Shape
}): LCutMove {
  return { name: "lcut", blockId, orientation, point: [x, y], blockShape: shape }
}

export default LineCut