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
        [200, 200]
      ],
      color: [0, 255, 0, 1]
    },
    {
      id: "0.1",
      shape: [
        [200, 0],
        [400, 200]
      ],
      color: [10, 23, 244, 1]
    }
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
