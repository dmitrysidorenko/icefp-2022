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

export interface Canvas {
  blockCounter: number;
  blocks: Block[],
  size: {
    width: number;
    height: number;
  };
}

export function isSimple(block: Block): block is SimpleBlock {
  return "color" in block;
}

// export function isComplex(block: Block): block is ComplexBlock {
//   return "children" in block;
// }

export function initCanvas(props: { width: number; height: number }): Canvas {
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
export type PCutMove = ["cut", BlockId, Point]
export type LCutMove = ["cut", BlockId, [Orientation], [number]]
export type ColorMove = ["color", BlockId, Color]
export type SwapMove = ["swap", BlockId, BlockId]
export type MergeMove = ["merge", BlockId, BlockId]

export type Move = PCutMove | LCutMove | ColorMove | SwapMove | MergeMove
export type MoveCommand<P = Record<string, unknown>> = (options: P & { blocks: Block[] }) => MoveCommandResult | Promise<MoveCommandResult>
export interface MoveCommandResult {
  blocks: Block[];
  moves: Move[]
}