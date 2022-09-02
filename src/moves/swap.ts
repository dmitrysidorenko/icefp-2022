import { findBlockWithParent } from "../find-block";
import { Canvas, Shape } from "../types";

export default function SwapMove({
  canvas,
  block1Ids: [block1Id, block2Id]
}: {
  canvas: Canvas;
  block1Ids: [string, string];
}) {
  const searchResult1 = findBlockWithParent(canvas, block1Id);
  const searchResult2 = findBlockWithParent(canvas, block2Id);
  if (!searchResult1 || !searchResult2) {
    if (!searchResult1) {
      console.error(`Block "${block1Id}" not found`);
    }
    if (!searchResult1) {
      console.error(`Block "${block2Id}" not found`);
    }
    return;
  }

  const [block1, parent1] = searchResult1;
  const [block2, parent2] = searchResult2;

  const w1 = getWidth(block1.shape);
  const h1 = getHeight(block1.shape);
  const w2 = getWidth(block2.shape);
  const h2 = getHeight(block2.shape);
  const isSameShape = w1 === w2 && h1 === h2;

  if (isSameShape) {
    block1.id = block2Id;
    block2.id = block1Id;
  } else {
    console.error(
      `Blocks "${block1Id}" and "${block2Id}" have different shape. Can't swap.`
    );
  }
}

function getWidth([[p1x], [p2x]]: Shape): number {
  return p2x - p1x;
}
function getHeight([[, p1y], [, p2y]]: Shape): number {
  return p2y - p1y;
}
