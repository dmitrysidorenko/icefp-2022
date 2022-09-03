import { Block, Color, initCanvas, MoveCommand, Point, Shape, SimpleBlock } from "../types";
import ColorMove, { colorBlock } from "./color";
import bim from 'browser-image-manipulation';
import PointCut, { PointCutBlock } from "./point-cut";
import { findBlock } from "../find-block";


export const RasterizeMove: MoveCommand<{
  target: HTMLCanvasElement,
  blockId: string
}> = async ({
  target,
  blocks,
  blockId,
}) => {
    const block = findBlock(blocks, blockId);
    const otherBlocks = blocks.filter(b => b.id !== blockId);
    const croppedTarget = await crop(target, block.shape);
    document.getElementById("canvases")?.appendChild(croppedTarget);

    const newBlocks = await rasterizeBlock(croppedTarget, block);
    return { blocks: [...otherBlocks, ...newBlocks], moves: [] };
  }



async function rasterizeBlock(target: HTMLCanvasElement, block: Block) {
  const scaled = await resize(target, 2, 2);
  document.getElementById("canvases")?.appendChild(scaled);
  const [bl, br, tr, tl] = PointCutBlock(block, center(block.shape));

  console.log([bl, br, tr, tl]);

  return [
    colorBlock(bl, getColor(scaled, 0, 0)),
    colorBlock(br, getColor(scaled, 1, 0)),
    colorBlock(tr, getColor(scaled, 1, 1)),
    colorBlock(tl, getColor(scaled, 0, 1)),
  ];
}


function center(shape: Shape): Point {
  const [[x1, y1], [x2, y2]] = shape;

  return [avg(x1, x2), avg(y1, y2)];
}

function avg(one: number, two: number): number {
  return Math.floor((one + two) / 2);
}

function resize(img: HTMLCanvasElement, width: number, height: number): Promise<HTMLCanvasElement> {
  return new bim().loadCanvas(img).resize(width, height).saveAsCanvas();
}

function getColor(img: HTMLCanvasElement, x: number, y: number): Color {
  const ctx = img.getContext('2d');
  const inverted = invert(img, [x, y]);
  const color = ctx?.getImageData(inverted[0], inverted[1], 1, 1).data;
  if (color) {
    console.log('color', x, y, color);
    return [color[0], color[1], color[2], color[3]];
  }
  throw new Error("Pixel missing");
}

function crop(img: HTMLCanvasElement, shape: Shape): Promise<HTMLCanvasElement> {
  const { width, height } = shapeSize(shape);
  const [startX, startY] = invert(img, [shape[0][0], shape[1][1]]);
  console.log('cropping', width, height, startX, startY);
  return new bim().loadCanvas(img).crop(width, height, startX || 0.1, startY || 0.1).saveAsCanvas();
}

function invert(img: HTMLCanvasElement, point: Point): Point {
  console.log('inverting', img.width, img.height, point, [point[0], img.height - point[1] - 1]);
  return [point[0], img.height - point[1] - 1];
}

function shapeSize(shape: Shape): { width: number, height: number } {
  return {
    width: shape[1][0] - shape[0][0],
    height: shape[1][1] - shape[0][1],
  }
}
