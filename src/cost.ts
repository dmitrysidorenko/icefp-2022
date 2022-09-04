import { Move, shapeSize, SimpleBlock, Size, sizeArea } from "./types";

type MoveName = Move["name"];

const baseCost: {[key in MoveName]: number} = {
  "pcut": 10,
  "lcut": 7,
  "color": 5,
  "swap": 3,
  "merge": 1
};

export function moveCost(move: MoveName, block: SimpleBlock, canvasSize: Size): number {
  return Math.round(baseCost[move] * sizeArea(canvasSize) / sizeArea(shapeSize(block.shape)))
}
