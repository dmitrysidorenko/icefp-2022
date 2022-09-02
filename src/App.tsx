import { useState } from "react";
import Editor, { EditorProvider } from "./Editor";
import ColorMove from "./moves/color";
import LineCut from "./moves/line-cut";
import PointCut from "./moves/point-cut";
import { SimpleBlock } from "./types";
import "./styles.css";

export default function App() {
  const [blocks, setBlocks] = useState<SimpleBlock[]>([
    {
      id: "0.0",
      shape: [
        [0, 0],
        [400, 400]
      ],
      color: [255, 255, 255, 1]
    },
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
      >
        <Editor
          size={{ height: 400, width: 400 }}
          blocks={blocks}
        />
      </EditorProvider>
    </div >
  );
}
