import { Block, Move, MoveCommandResult, Orientation, shapeSize, SimpleBlock } from "../types";
import LineCut from "./line-cut";
import PointCut from "./point-cut";
import { Image } from '../image';
import { findBlock } from "../find-block";


export async function bruteForceBlock(blocks: SimpleBlock[], blockId: string, image: Image): Promise<MoveCommandResult> {
  const block = findBlock(blocks, blockId);

  const variants = [
    ...await lineCutVariants(block, "horizontal"),
    ...await lineCutVariants(block, "vertical"),
    ...pointCutVariants(block),
  ];

  const colorized = variants.map(cut => colorizeCut(cut, image));

  const [costDiff, move] = bestMove(block, image, colorized);

  if (costDiff < 0) {
    return move;
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

function autoColor(block: SimpleBlock, image: Image): MoveCommandResult {
  return {} as any;
}

function bestMove(block: SimpleBlock, image: Image, moves: MoveCommandResult[]): [number, MoveCommandResult] {
  return [] as any;
}

function colorizeCut(cut: MoveCommandResult, image: Image): MoveCommandResult {
  return cut.blocks.reduce<MoveCommandResult>((result, block) => {
    const colorized = autoColor(block, image);
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

async function lineCutVariants(block: SimpleBlock, orientation: Orientation): Promise<MoveCommandResult[]> {
  const size = shapeSize(block.shape);
  const steps = orientation === "horizontal" ? cutSteps(size.height) : cutSteps(size.width);

  const promises = steps.map(async (step) => await LineCut({
      blockId: block.id,
      blocks: [block],
      orientation,
      point: [block.shape[0][0] + 1, block.shape[0][1] + step],
    }));

  return await Promise.all(promises);
}

function cutSteps(size: number): number[] {
  const cuts: number[] = [];

  for (let i = 10; i < size; i++) {
    if (size % i === 0) {
      cuts.push(i);
    }
  }

  return cuts;
}
