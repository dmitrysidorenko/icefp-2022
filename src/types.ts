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
  children: Block[];
}

export type Block = SimpleBlock | ComplexBlock;

export interface Canvas {
  blockCounter: number;
  blocks: Block[];
  size: {
    width: number;
    height: number;
  };
}

export function isSimple(block: Block): block is SimpleBlock {
  return "color" in block;
}

export function isComplex(block: Block): block is ComplexBlock {
  return "children" in block;
}

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
        children: []
      }
    ],
    size: {
      width: props.width,
      height: props.height
    }
  };
}
