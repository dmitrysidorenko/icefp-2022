import { Block, Move, MoveCommandResult, Orientation, shapeSize, SimpleBlock } from "../types";
import LineCut from "./line-cut";
import PointCut from "./point-cut";
import { getImageData, Image } from '../image';
import { findBlock } from "../find-block";
import { imageDataBlockAvgColor, imageDataBlockDiff, imageDataBlockFrequentColor } from "../color-diff";
import { colorBlock } from "./color";


export async function bruteForceBlock(blocks: SimpleBlock[], blockId: string, image: Image): Promise<MoveCommandResult> {
  const block = findBlock(blocks, blockId);
  const imageData = await getImageData(image)

  const variants = [
    ...lineCutVariants(block, "horizontal"),
    ...lineCutVariants(block, "vertical"),
    ...pointCutVariants(block),
  ];

  const colorized = variants.map(cut => colorizeCut(cut, imageData));

  const bestMoveResult = bestMove(block, imageData, colorized);

  if (bestMoveResult) {
    const move = bestMoveResult[1];
    return {
      blocks: [...move.blocks, ...blocks.filter(b => b.id !== blockId)],
      moves: move.moves,
      cost: move.cost
    }
  }

  return {
    blocks,
    moves: [],
    cost: 0
  };
}

export async function bruteForceAllBlocks(blocks: SimpleBlock[], image: Image): Promise<MoveCommandResult> {
  const allProcessed = blocks.map(async (block) => {
    return await bruteForceBlock(blocks, block.id, image);
  });

  const all = await Promise.all(allProcessed);

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
}

function autoColor(block: SimpleBlock, imageData: ImageData): MoveCommandResult {
  return ColorBlockIfNeeded(block, imageData)
}

function bestMove(block: SimpleBlock, imageData: ImageData, moves: MoveCommandResult[]): [number, MoveCommandResult] | null {
  const originalDiff = imageDataBlockDiff(block, imageData)
  const bestMove = moves.map<[number, MoveCommandResult]>(mcr => {
    const totalCost = mcr.blocks.reduce(
      (d, b) => d + imageDataBlockDiff(b, imageData), 0
    ) + mcr.cost;
    return [totalCost, mcr]
  }).sort(([a], [b]) => a < b ? -1 : 1)[0]

  if (bestMove && bestMove[0] < originalDiff) {
    return bestMove
  }

  return null;
}

function colorizeCut(cut: MoveCommandResult, imageData: ImageData): MoveCommandResult {
  return cut.blocks.reduce<MoveCommandResult>((result, block) => {
    const colorized = autoColor(block, imageData);
    result.blocks = [...result.blocks, ...colorized.blocks];
    result.cost += colorized.cost;
    result.moves = [...result.moves, ...colorized.moves];
    return result;
  }, {
    blocks: [],
    moves: cut.moves,
    cost: cut.cost
  });
}


function pointCutVariants(block: SimpleBlock): MoveCommandResult[] {
  const size = shapeSize(block.shape);

  const cuts: MoveCommandResult[] = [];

  cutSteps(size.width).forEach(xStep => {
    cutSteps(size.height).forEach(yStep => {
      cuts.push(
        PointCut({
          blockId: block.id,
          blocks: [block],
          point: [xStep, yStep],
        }) as MoveCommandResult
      );
    });
  });

  return cuts;
}

function lineCutVariants(block: SimpleBlock, orientation: Orientation): MoveCommandResult[] {
  const size = shapeSize(block.shape);
  const steps = orientation === "horizontal" ? cutSteps(size.height) : cutSteps(size.width);

  return steps.map((step) => LineCut({
    blockId: block.id,
    blocks: [block],
    orientation,
    point: orientation === "horizontal" ? [block.shape[0][0] + 1, block.shape[0][1] + step] : [block.shape[0][0] + step, block.shape[0][1] + 1]
  }) as MoveCommandResult);
}

function cutSteps(size: number): number[] {
  const cuts: {[key: number]: unknown} = {};

  for (let i = 10; i < size; i++) {
    if (size % i !== 0) {
      continue;
    }

    for (let j = i; j < size; j += i) {
      cuts[j] = 1;
    }
  }

  return [...Object.keys(cuts)].map(k => parseInt(k));
}

function ColorBlockIfNeeded(block: Block, imageData: ImageData): MoveCommandResult {
  // const avgColor = imageDataBlockAvgColor(imageData, block)
  const avgColor = imageDataBlockFrequentColor(imageData, block);
  const { blocks: [coloredBlock], moves, cost } = colorBlock(block, avgColor)
  const originalDiff = imageDataBlockDiff(block, imageData)
  const coloredDiff = imageDataBlockDiff(coloredBlock, imageData)

  // if (JSON.stringify(block.shape) === JSON.stringify([[0, 0], [40, 399]])) {
  //   console.log(block, avgColor, originalDiff, coloredDiff, cost);
  // }

  if (coloredDiff + cost <= originalDiff) {
    return {
      blocks: [coloredBlock],
      moves,
      cost
    }
  }
  return {
    blocks: [block],
    moves: [],
    cost: 0
  }
}