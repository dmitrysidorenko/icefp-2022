export type Point = [number, number];

export type Shape = [Point, Point];

export type Color = [number, number, number, number];

export type Orientation = "horizontal" | "vertical";

export interface SimpleBlock {
  id: string;
  shape: Shape;
  color: Color;
}

export interface ComplexBlock {
  id: string;
  shape: Shape;
  children: SimpleBlock[];
}

// export type Block = SimpleBlock | ComplexBlock;
export type Block = SimpleBlock;

export interface Size {
  width: number;
  height: number;
}

export interface Canvas {
  blockCounter: number;
  blocks: Block[],
  size: Size;
}

export function isSimple(block: Block): block is SimpleBlock {
  return "color" in block;
}

// export function isComplex(block: Block): block is ComplexBlock {
//   return "children" in block;
// }

export function initCanvas(props: Size): Canvas {
  return {
    blockCounter: 0,
    blocks: [
      {
        id: "0",
        shape: [
          [0, 0],
          [400, 200]
        ],
        color: [255, 255, 255, 255]
      }
    ],
    size: {
      width: props.width,
      height: props.height
    }
  };
}


export type BlockId = string
export type PCutMove = { name: "pcut", blockId: BlockId, point: Point, blockShape: Shape }
export type LCutMove = { name: "lcut", blockId: BlockId, point: Point, orientation: Orientation, blockShape: Shape }
export type ColorMove = { name: "color", blockId: BlockId, color: Color, blockShape: Shape }
export type SwapMove = { name: "swap", block1Id: BlockId, block2Id: BlockId, block1Shape: Shape, block2Shape: Shape }
export type MergeMove = { name: "merge", block1Id: BlockId, block2Id: BlockId, block1Shape: Shape, block2Shape: Shape }

export type Move = PCutMove | LCutMove | ColorMove | SwapMove | MergeMove
export type MoveCommand<P = Record<string, unknown>> = (options: P & { blocks: Block[] }) => MoveCommandResult | Promise<MoveCommandResult>
export interface MoveCommandResult {
  blocks: Block[];
  moves: Move[];
  cost: number;
}


export function shapeSize(shape: Shape): Size {
  return {
    width: shape[1][0] - shape[0][0],
    height: shape[1][1] - shape[0][1],
  }
}

export function sizeArea(size: Size): number {
  return size.width * size.height;
}
