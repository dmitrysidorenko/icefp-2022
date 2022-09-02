import { Block, initCanvas, Point, Shape } from "../types";
// import pica from 'pica';
import PointCut, { PointCutBlock } from "./point-cut";

// const ipica = pica();

// ipica.resize()

export function rasterize(target: any) {
  const canvas = initCanvas({ width: target.width, height: target.height });
}


function rasterizeBlock(target: any, block: Block) {
  const scaled = target.resize(target.width / 2, target.height / 2);

  // const blocks = PointCutBlock(block)


  const blocks = PointCutBlock(block, center(block.shape));
  // block.

}


function center(shape: Shape): Point {
  const [[x1, y1], [x2, y2]] = shape;

  return [avg(x1, x2), avg(y1, y2)];
}

function avg(one: number, two: number): number {
  return (one + two) / 2;
}
