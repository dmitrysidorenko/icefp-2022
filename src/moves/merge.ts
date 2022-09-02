// import { Canvas, ComplexBlock, isComplex, isSimple, Shape, SimpleBlock } from "../types";
// import { findBlock } from "../find-block";
// import { removeChild } from "../remove-child";

// export function merge(
//   canvas: Canvas,
//   blockOneId: string,
//   blockTwoId: string
// ): void {
//   const one = findBlock(canvas.blocks, blockOneId);
//   const two = findBlock(canvas.blocks, blockTwoId);

//   if (!one || !two) {
//     throw new Error(`blocks not found`);
//   }

//   canvas.blockCounter++;

//   const newParent: ComplexBlock = {
//     // shape: []
//     id: canvas.blockCounter.toString(),
//     children: [blockOne, blockTwo]
//   };

//   if (parent) {
//     removeChild(parent, blockOne.id);
//     removeChild(parent, blockTwo.id);

//     parent.children.push(newParent);
//   } else {
//     canvas.blocks.push(newParent);
//   }
// }

// function horizonalMerge(one: Shape, two: Shape): Shape | null {
//   const canMerge = one[0][0] === two[0][0] && one[1][0] === two[1][0];
//   if (!canMerge) {
//     return null;
//   }

//   return [
//     [one[0][0], Math.min(one[0][1], two[0][1])],
//     [one[1][0], Math.max(one[1][1], two[1][1])]
//   ];
// }

// function verticalMerge(one: Shape, two: Shape): Shape | null {
//   const canMerge = one[0][1] === two[0][1] && one[1][1] === two[1][1];
//   if (!canMerge) {
//     return null;
//   }

//   return [
//     [Math.min(one[0][1], two[0][1]), one[0][1]],
//     [Math.max(one[1][1], one[1][1]), one[1][1]]
//   ];
// }

// function getChildren(block: Block): SimpleBlock[] {
//   if (isSimple(block)) {
//     return [block];
//   }

//   if (isComplex(block)) {
//     return block.ca
//   }
// }

// // [x11, y11], [x12, y12]
// // [x21, y21], [x22, y22]
