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
  avgColor,
  cropImage,
  getAllColors,
  getColor,
  getColors,
  Image,
  resizeImage,
} from "../image";
import { colorDiff, imageBlockDiff } from "../color-diff";
import { moveCost } from "../cost";

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
    cost: all.reduce((acc, el) => {
      return acc + el.cost;
    }, 0),
  };
};

async function rasterizeBlock(
  target: Image,
  block: Block
): Promise<MoveCommandResult> {
  if ((await diffColorsOnImage(target, block, 4)) < 10) {
    return { blocks: [block], moves: [], cost: 0 };
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
    cost,
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
      acc.cost += moveCost("color", el[0] as Block, {width: 400, height: 400});
      return acc;
    },
    {
      blocks: [],
      moves: [...moves],
      cost: cost,
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

// async function autoColor(block: SimpleBlock, target: Image) {
//   const targetColor = await avgColor(target);

//   const currentDiff = imageBlockDiff(target, block.color);
//   const newDiff = imageBlockDiff(target, targetColor);
//   const colorCost = moveCost("color", block, {width: 400, height: 400});

//   if (currentDiff < newDiff + colorCost) {

//   }

//   return {

//   }

//   // if (colorDiff(targetColor, block.color) > SHOULD_COLOR_THRESHOLD) {
//   //     const r = colorBlock(block, targetColor);
//   //     acc.blocks.push(...r.blocks);
//   //     acc.moves.push(...r.moves);
//   //     acc.cost += moveCost("color", el[0] as Block, {width: 400, height: 400});
//   //     return acc;
//   // }
// }

function center(shape: Shape): Point {
  const [[x1, y1], [x2, y2]] = shape;

  return [avg(x1, x2), avg(y1, y2)];
}

function avg(one: number, two: number): number {
  return Math.floor((one + two) / 2);
}
