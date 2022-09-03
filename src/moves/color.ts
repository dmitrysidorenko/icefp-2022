import { Color, Canvas, SimpleBlock, MoveCommand, BlockId, MoveCommandResult } from "../types";

export const ColorMove: MoveCommand<{ blockId: BlockId, color: Color }> = ({
  blocks,
  blockId,
  color
}: {
  blocks: Canvas['blocks'];
  blockId: string;
  color: Color;
}) => {
  return blocks.reduce<MoveCommandResult>((acc, block) => {
    if (block.id === blockId) {
      const r = colorBlock(block, color)
      acc.blocks.push(...r.blocks)
      acc.moves.push(...r.moves)
    }
    else {
      acc.blocks.push(block)
    }
    return acc
  }, {
    blocks: [],
    moves: []
  })
}

export function colorBlock(block: SimpleBlock, color: Color): MoveCommandResult {
  return {
    blocks: [{ ...block, color }],
    moves: [{
      name: 'color', color, blockId: block.id, blockShape: [[...block.shape[0]], [...block.shape[1]]]
    }]
  };
}

export default ColorMove