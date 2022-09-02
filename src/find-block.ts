import { Block, Canvas, ComplexBlock, isComplex } from "./types";

function findBlockInList(
  blocks: Block[],
  blockId: string,
  parent: ComplexBlock | null
): [Block, ComplexBlock | null] | null {
  for (const child of blocks) {
    if (child.id === blockId) {
      return [child, parent];
    }

    if (isComplex(child)) {
      const found = findBlockInList(child.children, blockId, child);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function findBlock(canvas: Canvas, blockId: string): Block | null {
  const found = findBlockInList(canvas.blocks, blockId, null);
  return found ? found[0] : null;
}

export function findBlockWithParent(
  canvas: Canvas,
  blockId: string
): [Block, ComplexBlock | null] | null {
  return findBlockInList(canvas.blocks, blockId, null);
}

export function findChildBlock(
  block: ComplexBlock,
  blockId: string
): Block | null {
  const found = findBlockInList(block.children, blockId, block);
  return found ? found[0] : null;
}
