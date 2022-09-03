import { Color } from "./types";

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
}

export function colorDiff(one: Color, two: Color): number {
  return SimilarityChecker.pixelDiff(
    new RGBA(one),
    new RGBA(two),
  );
}
