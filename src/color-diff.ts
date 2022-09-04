import { Block, Color, Point } from "./types";
import { getAllColors, Image } from "./image";

class RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(rgba: [number, number, number, number] = [0, 0, 0, 0]) {
    [this.r, this.g, this.b, this.a] = rgba;
  }
}

class SimilarityChecker {
  static imageDiff(f1: RGBA[], f2: RGBA[]): number {
    let diff = 0;
    let alpha = 0.005;
    for (let index = 0; index < f1.length; index++) {
      const p1 = f1[index];
      const p2 = f2[index];
      diff += this.pixelDiff(p1, p2);
    }
    return Math.round(diff * alpha);
  }
  static pixelDiff(p1: RGBA, p2: RGBA): number {
    const rDist = (p1.r - p2.r) * (p1.r - p2.r);
    const gDist = (p1.g - p2.g) * (p1.g - p2.g);
    const bDist = (p1.b - p2.b) * (p1.b - p2.b);
    const aDist = (p1.a - p2.a) * (p1.a - p2.a);
    const distance = Math.sqrt(rDist + gDist + bDist + aDist);
    return distance;
  }
  static imageColorDiff(f1: RGBA[], c: RGBA): number {
    let diff = 0;
    let alpha = 0.005;
    for (let index = 0; index < f1.length; index++) {
      const p1 = f1[index];
      const p2 = c;
      diff += this.pixelDiff(p1, p2);
    }
    return Math.round(diff * alpha);
  }
}

export function pixelDiff([p1r, p1g, p1b, p1a]: Color, [p2r, p2g, p2b, p2a]: Color): number {
  const rDist = (p1r - p2r) * (p1r - p2r);
  const gDist = (p1g - p2g) * (p1g - p2g);
  const bDist = (p1b - p2b) * (p1b - p2b);
  const aDist = (p1a - p2a) * (p1a - p2a);
  const distance = Math.sqrt(rDist + gDist + bDist + aDist);
  return distance;
}

export function imageColorDiff(f1: Color[], c: Color): number {
  let diff = 0;
  let alpha = 0.005;
  for (let index = 0; index < f1.length; index++) {
    const p1 = f1[index];
    const p2 = c;
    diff += pixelDiff(p1, p2);
  }
  return Math.round(diff * alpha);
}

export function colorDiff(one: Color, two: Color): number {
  return SimilarityChecker.pixelDiff(new RGBA(one), new RGBA(two));
}

export function imageBlockDiff(image: Image, blockColor: Color) {
  const colors = getAllColors(image);
  const blockColors: RGBA[] = [];
  colors.forEach((c) => blockColors.push(new RGBA(c)));

  return SimilarityChecker.imageDiff(
    colors.map((c) => new RGBA(c)),
    colors.map(() => new RGBA(blockColor))
  );
}

export function getPixelFromImageData([x, y]: Point, imageData: ImageData): Color {
  const i = (y * imageData.width + x) * 4;
  const [r, g, b, a] = imageData.data.slice(i, i + 4).reduce<number[]>((acc, c) => {
    acc.push(c)
    return acc
  }, []);
  return [r, g, b, a]
}

export function getBlockImageDataColors(imageData: ImageData, { shape: [p1, p2], color }: Block): Color[] {
  const colors: Color[] = []
  for (let x = p1[0]; x < p2[0]; x++) {
    for (let y = p1[1]; y < p2[1]; y++) {
      const pixel = getPixelFromImageData([x, y], imageData)
      colors.push(pixel)
    }
  }
  return colors;
}

export function imageDataBlockDiff(block: Block, imageData: ImageData) {
  const pixels = getBlockImageDataColors(imageData, block)
  return imageColorDiff(pixels, block.color)
}

export function imageDataBlockAvgColor(imageData: ImageData, block: Block): Color {
  const colors = getBlockImageDataColors(imageData, block);
  const sum = colors.reduce<Color>((acc, color) => {
    acc[0] += color[0] // * color[0]
    acc[1] += color[1] // * color[1]
    acc[2] += color[2] // * color[2]
    acc[3] += color[3] // * color[3]
    return acc
  }, [0, 0, 0, 0])
  return [
    Math.round(sum[0] / colors.length),
    Math.round(sum[1] / colors.length),
    Math.round(sum[2] / colors.length),
    Math.round(sum[3] / colors.length),
  ]
}

export function imageDataBlockFrequentColor(imageData: ImageData, block: Block): Color {
  const colors = getBlockImageDataColors(imageData, block);

  const colorsStats: {[key: string]: number} = {};

  colors.forEach(color => {
    const key = JSON.stringify(color);
    if (key in colorsStats) {
      colorsStats[key] += 1;
    } else {
      colorsStats[key] = 1;
    }
  });

  const top = Object.entries(colorsStats).sort(([, counter], [,counter2]) => counter2 - counter)[0];

  return JSON.parse(top[0]);
}
