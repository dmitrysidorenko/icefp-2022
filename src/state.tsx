import { makeAutoObservable } from "mobx";
import { createContext, PropsWithChildren, useContext } from "react";
import {
  Block,
  Color,
  Move,
  MoveCommandResult,
  Orientation,
  Point,
  SimpleBlock,
  Size,
} from "./types";
import { Image, imageFromFile } from "./image";
import ColorMove from "./moves/color";
import LineCut from "./moves/line-cut";
import PointCut from "./moves/point-cut";
import { RasterizeMove } from "./moves/rasterize";
import { imageBlockDiff } from "./color-diff";

export type Tool =
  | "PointCut"
  | "VerticalSplit"
  | "HorizontalSplit"
  | "Color"
  | "Rasterize";

export const initialBlock = (size: Size): SimpleBlock => {
  return {
    id: "0",
    shape: [
      [0, 0],
      [size.width - 1, size.height - 1],
    ],
    color: [255, 255, 255, 1],
  };
};

export class State {
  size: Size = { width: 400, height: 400 };

  blocks: Block[] = [];
  moves: Move[] = [];
  movesCost: number = 0;

  tool: Tool | null = null;
  color: Color = [0, 0, 0, 255];

  point: Point = [0, 0];

  target: Image | null = null;
  targetUrl: string = "";
  opacity = 0.2;

  setTool(tool: Tool | null) {
    this.tool = tool;
  }

  setColor(color: Color) {
    this.color = color;
  }

  reset() {
    this.size = { width: 400, height: 400 };
    this.blocks = [initialBlock(this.size)];
    this.moves = [];
    this.movesCost = 0;
  }

  setPoint(point: Point) {
    this.point = point;
  }

  setTargetFile(file: File) {
    this.targetUrl = URL.createObjectURL(file);
    imageFromFile(file).then((image) => {
      this.target = image;
      console.log("Image diff", imageBlockDiff(image, [255, 255, 255, 255]));
    });
  }

  setOpacity(opacity: number) {
    this.opacity = opacity;
  }

  handleBlockClick(blockId: string) {
    if (!this.tool) {
      return;
    }

    const newPoint: Point = [this.point[0], this.size.height - this.point[1]];

    switch (this.tool) {
      case "Color": {
        return this.colorBlock(blockId);
      }
      case "HorizontalSplit":
      case "VerticalSplit": {
        return this.lineSplitBlock(
          blockId,
          this.tool === "HorizontalSplit" ? "horizontal" : "vertical",
          newPoint
        );
      }
      case "PointCut": {
        return this.pointSplitBlock(blockId, newPoint);
      }
      case "Rasterize": {
        return this.rasterize(blockId);
      }
    }
  }

  async colorBlock(blockId: string) {
    const result = await ColorMove({
      blockId,
      blocks: this.blocks,
      color: this.color,
    });
    this.applyMove(result);
  }

  async lineSplitBlock(
    blockId: string,
    orientation: Orientation,
    point: Point
  ) {
    const result = await LineCut({
      blockId,
      blocks: this.blocks,
      orientation,
      point,
    });
    this.applyMove(result);
  }

  async pointSplitBlock(blockId: string, point: Point) {
    const result = await PointCut({
      blockId,
      blocks: this.blocks,
      point,
    });
    this.applyMove(result);
  }

  async rasterize(blockId: string) {
    if (!this.target) {
      return;
    }
    const result = await RasterizeMove({
      target: this.target,
      blockId,
      blocks: this.blocks,
    });
    this.applyMove(result);
  }

  applyMove({ blocks, moves, cost }: MoveCommandResult) {
    this.blocks = blocks;
    this.moves.push(...moves);
    this.movesCost += cost;
  }

  constructor() {
    this.reset();
    makeAutoObservable(this);
  }
}

export const stateCtx = createContext<State | null>(null);

export function useEditorState(): State {
  const value = useContext(stateCtx);
  if (!value) {
    throw new Error("State context not set");
  }

  return value;
}

export function StateProvider({
  state,
  children,
}: PropsWithChildren<{ state: State }>) {
  return <stateCtx.Provider value={state}>{children}</stateCtx.Provider>;
}
