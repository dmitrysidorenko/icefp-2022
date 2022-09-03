import React, { useEffect, useRef } from "react";
import { observable } from 'mobx';
import { observer } from "mobx-react-lite";
import { Color, Point, Shape, shapeSize } from "./types";


export type Image = ImageBitmap;


export function imageFromFile(source: File | HTMLCanvasElement): Promise<Image> {
  return createImageBitmap(source);
}

export function cropImage(image: Image, shape: Shape): Promise<Image> {
  const {width, height} = shapeSize(shape);
  const [startX, startY] = invertY(image, [shape[0][0], shape[1][1]]);

  return createImageBitmap(image, startX, startY, width, height);
}

export function resizeImage(image: Image, width: number, height: number): Promise<Image> {
  return createImageBitmap(image, 0, 0, image.width, image.height, {
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: "pixelated"
  });
}

export function getColor(image: Image, point: Point): Color {
  return getColors(image, [point])[0];
}

export function getColors(image: Image, points: Point[]): Color[] {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("no context");
  }

  ctx.drawImage(image, 0, 0);

  return points.map(point => {
    const invertedPoint = invertY(image, point);
    const data = ctx.getImageData(invertedPoint[0], invertedPoint[1], 1, 1).data;

    return [data[0], data[1], data[2], data[3]];
  });
}

// export function getAllColors(image: Image): Color[] {
//   const ctx = toCtx(image);

//   const rgbas = ctx.getImageData(0, 0, image.width, image.height).data;
//   const colors = groupByChunks(rgbas, 4);

//   return points.map(point => {
//     const invertedPoint = invertY(image, point);
//     const data = ctx.getImageData(invertedPoint[0], invertedPoint[1], 1, 1).data;

//     return [data[0], data[1], data[2], data[3]];
//   });
// }

function groupByChunks<T>(things: T[], chunkSize: number): T[][] {
  const group: T[][] = [];
  for (var i = 0, j = 0; i < things.length; i++) {
      if (i >= chunkSize && i % chunkSize === 0)
          j++;
      group[j] = group[j] || [];
      group[j].push(things[i])
  }
  return group;
}

function toCtx(image: Image): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("no context");
  }

  ctx.drawImage(image, 0, 0);

  return ctx;
}

function invertY(img: Image, point: Point): Point {
  return [point[0], img.height - point[1] - 1];
}

const imageLog: {image: Image, comment?: string}[] = observable([]);

export function logImage(image: Image, comment?: string): void {
  imageLog.push({image, comment});
}


export const ImageLogger = observer(() => {
  return <div style={{
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    overflow: "auto",
    padding: 5
  }}>
    {imageLog.map((log, index) => {
      return <ImageLog key={index} image={log.image} comment={log.comment} />
    })}
  </div>
});

const ImageLog = observer(({image, comment}: {image: Image, comment?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);
  }, []);

  return <div style={{marginBottom: "15px"}}>
    <canvas ref={canvasRef} style={{
      width: 80,
      height: 80,
      imageRendering: "pixelated"
    }}></canvas>
    <div style={{ color: "gray" }}>{`${image.width}px x ${image.height}px`}</div>
    {comment && <div style={{color: "darkgreen", clear: "both"}}>{comment}</div>}
  </div>;
});


export function ImageTest() {
  async function setFile(file: File) {
    const image = await imageFromFile(file);
    logImage(image, "initial image");
    logImage(await cropImage(image, [[0, 0], [199, 199]]), "bottom left");
    logImage(await cropImage(image, [[200, 200], [399, 399]]), "top right");
    logImage(await resizeImage(image, 100, 100), "scaled to 100");
    logImage(await resizeImage(image, 2, 2), "scaled to 2");
  }

  return <div style={{marginTop: 200}}>
        Image test
        <input accept="image/*" type='file' id="imgInp" onChange={evt => {
          const file = evt.target.files?.item(0)
          if (file) {
            setFile(file);
          }
        }}
        />
  </div>;
}