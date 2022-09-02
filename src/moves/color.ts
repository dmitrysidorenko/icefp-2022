import { Color, Canvas } from "../types";
import { findBlock } from "../find-block";

export default function ColorMove({
  blocks,
  blockId,
  color
}: {
  blocks: Canvas['blocks'];
  blockId: string;
  color: Color;
}) {
  return blocks.map((block) => block.id === blockId ? { ...block, color } : block)
}
