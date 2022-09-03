import { useState } from "react";
import Editor, { EditorProvider } from "./Editor";
import ColorMove from "./moves/color";
import LineCut from "./moves/line-cut";
import PointCut from "./moves/point-cut";
import { SimpleBlock } from "./types";
import "./styles.css";


const canvasSize = {
  width: 600,
  height: 600
}

const initialBlock: SimpleBlock = {
  id: "0",
  shape: [
    [0, 0],
    [canvasSize.width, canvasSize.height]
  ],
  color: [255, 255, 255, 1]
}

export default function App() {
  const [blocks, setBlocks] = useState<SimpleBlock[]>([
    initialBlock,
  ])
  return (
    <div className="App">
      <EditorProvider
        colorBlock={({ blockId, color }) => setBlocks(blocks => ColorMove({ blockId, blocks, color }))}
        lineSplitBlock={({ blockId, orientation, point }) => setBlocks(blocks => LineCut({
          blockId, blocks, orientation, point
        }))}
        pointSplitBlock={({ blockId, point }) => setBlocks(blocks => PointCut({
          blockId, blocks, point
        }))}
        size={{ height: 400, width: 400 }}
        reset={() => setBlocks([initialBlock])}
        rasterize={() => { }}
      >
        <Editor
          size={canvasSize}
          blocks={blocks}
        />
      </EditorProvider>
    </div >
  );
}
