import { Color, Canvas, SimpleBlock, MoveCommand, BlockId } from "../types";

export const ColorMove: MoveCommand<{ blockId: BlockId, color: Color }> = ({
  blocks,
  blockId,
  color
}: {
  blocks: Canvas['blocks'];
  blockId: string;
  color: Color;
}) => {
  return {
    blocks: blocks.map((block) => block.id === blockId ? colorBlock(block, color) : block),
    moves: [["color", blockId, color]]
  }
}

export function colorBlock(block: SimpleBlock, color: Color): SimpleBlock {
  return { ...block, color };
}

export default ColorMove