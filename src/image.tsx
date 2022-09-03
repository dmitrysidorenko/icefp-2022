import React, { useEffect, useRef } from "react";
import { observable } from 'mobx';
import { observer } from "mobx-react-lite";


export type Image = ImageBitmap;


export function imageFromFile(source: File | HTMLCanvasElement): Promise<Image> {
  return createImageBitmap(source);
}

const imageLog: {image: Image, comment?: string}[] = observable([]);

export function logImage(image: Image, comment?: string): void {
  imageLog.push({image, comment});
}


export const ImageLogger = observer(() => {
  return <div id="image-logger">
    {imageLog.map((log, index) => {
      return '';
    })}
  </div>
});

const ImageLog = observer(({image, comment}: {image: Image, comment?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current.getCon

  }, []);

  return <div>
    <canvas ref={canvasRef} style={{
      width: 50,
      height: 50,
      imageRendering: "pixelated"
    }}></canvas>
    <div style={{
      color: "gray"
    }}>{`width: ${image.width}  height: ${image.height}`}</div>
    {comment && <div style={{color: "darkgreen"}}>{comment}</div>}
  </div>;
});

