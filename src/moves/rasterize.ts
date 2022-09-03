import { Block, Color, initCanvas, MoveCommand, Point, Shape, SimpleBlock } from "../types";
import ColorMove, { colorBlock } from "./color";
import bim from 'browser-image-manipulation';
import PointCut, { PointCutBlock } from "./point-cut";
import { findBlock } from "../find-block";
import { cropImage, getColor, getColors, Image, resizeImage } from '../image';
import { colorDiff } from "../color-diff";


export const RasterizeMove: MoveCommand<{
  target: Image,
  blockId: string
}> = async ({
  target,
  blocks,
  blockId,
}) => {
    // const block = findBlock(blocks, blockId);
    // const otherBlocks = blocks.filter(b => b.id !== blockId);
    // const croppedTarget = await cropImage(target, block.shape);

    // const newBlocks = await rasterizeBlock(croppedTarget, block);
    // return { blocks: [...otherBlocks, ...newBlocks], moves: [] };

    const allRasterized = blocks.map(async block => {
      const croppedTarget = await cropImage(target, block.shape);

      return await rasterizeBlock(croppedTarget, block);
    });

    const all = await Promise.all(allRasterized);

    return {blocks: all.flat(), moves: []};
  }



async function rasterizeBlock(target: Image, block: Block) {
  const scaled = await resizeImage(target, 2, 2);

  const [blc, brc, trc, tlc] = getColors(scaled, [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]);

  const diffs = [blc, brc, trc, tlc].map(c => colorDiff(c, block.color));

  if (Math.max(...diffs) === 0) {
    return [block];
  }

  const [bl, br, tr, tl] = PointCutBlock(block, center(block.shape));

  return [
    colorBlock(bl, blc),
    colorBlock(br, brc),
    colorBlock(tr, trc),
    colorBlock(tl, tlc),
  ];
}


function center(shape: Shape): Point {
  const [[x1, y1], [x2, y2]] = shape;

  return [avg(x1, x2), avg(y1, y2)];
}

function avg(one: number, two: number): number {
  return Math.floor((one + two) / 2);
}

// function getColor(img: HTMLCanvasElement, x: number, y: number): Color {
//   const ctx = img.getContext('2d');
//   const inverted = invert(img, [x, y]);
//   const color = ctx?.getImageData(inverted[0], inverted[1], 1, 1).data;
//   if (color) {
//     console.log('color', x, y, color);
//     return [color[0], color[1], color[2], color[3]];
//   }
//   throw new Error("Pixel missing");
// }
