import {
  Block,
  Color,
  Move,
  MoveCommand,
  MoveCommandResult,
  Point,
  Shape,
  SimpleBlock,
} from "../types";
import { colorBlock } from "./color";
import { PointCutBlock } from "./point-cut";
import {
  cropImage,
  getAllColors,
  getColors,
  Image,
  resizeImage,
} from "../image";
import { colorDiff } from "../color-diff";

export const RasterizeMove: MoveCommand<{
  target: Image;
  blockId: string;
}> = async ({ target, blocks, blockId }) => {
  // const block = findBlock(blocks, blockId);
  // const otherBlocks = blocks.filter(b => b.id !== blockId);
  // const croppedTarget = await cropImage(target, block.shape);

  // const newBlocks = await rasterizeBlock(croppedTarget, block);
  // return { blocks: [...otherBlocks, ...newBlocks], moves: [] };

  const allRasterized = blocks.map(async (block) => {
    const croppedTarget = await cropImage(target, block.shape);

    return await rasterizeBlock(croppedTarget, block);
  });

  const all = await Promise.all(allRasterized);

  return {
    blocks: all.reduce<Block[]>((acc, el) => {
      acc.push(...el.blocks);
      return acc;
    }, []),
    moves: all.reduce<Move[]>((acc, el) => {
      acc.push(...el.moves);
      return acc;
    }, []),
  };
};

async function rasterizeBlock(
  target: Image,
  block: Block
): Promise<MoveCommandResult> {
  if ((await diffColorsOnImage(target, block, 4)) < 10) {
    return { blocks: [block], moves: [] };
  }

  const scaled = await resizeImage(target, 2, 2);

  const [blc, brc, trc, tlc] = getColors(scaled, [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]);

  const {
    blocks: [bl, br, tr, tl],
    moves,
  } = PointCutBlock(block, center(block.shape));

  return [
    [bl, blc],
    [br, brc],
    [tr, trc],
    [tl, tlc],
  ].reduce<MoveCommandResult>(
    (acc: MoveCommandResult, el) => {
      const r = colorBlock(el[0] as Block, el[1] as Color);
      acc.blocks.push(...r.blocks);
      acc.moves.push(...r.moves);
      return acc;
    },
    {
      blocks: [],
      moves: [...moves],
    }
  );
}

async function diffBlockColor(
  image: Image,
  block: SimpleBlock,
  gridSize: number
): Promise<number> {
  const scaled = await resizeImage(image, gridSize, gridSize);
  const colors = getAllColors(scaled);
  const diffs = colors.map((c) => colorDiff(c, block.color));

  return Math.max(...diffs);
}

async function diffColorsOnImage(
  image: Image,
  block: SimpleBlock,
  gridSize: number
): Promise<number> {
  const scaled = await resizeImage(image, gridSize, gridSize);
  const colors = getAllColors(scaled);

  let diff = 0;
  for (let i = 0; i < colors.length - 1; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      diff = Math.max(diff, colorDiff(colors[i], colors[j]));
    }
  }

  return diff;
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
