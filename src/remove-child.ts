import { ComplexBlock } from "./types";

export function removeChild(parent: ComplexBlock, blockId: string): void {
  parent.children = parent.children.filter((child) => child.id !== blockId);
}
