import { Block } from "./types";


export function findBlock(blocks: Block[], id: string): Block {
  const block = blocks.find(block => block.id === id);
  if (!block) {
    throw new Error(`Block not found: ${id}`)
  }

  return block;
}
