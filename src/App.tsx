import { useState } from "react";
import Editor, { EditorProvider } from "./Editor";
import ColorMove from "./moves/color";
import LineCut from "./moves/line-cut";
import PointCut from "./moves/point-cut";
import { Block, Move, SimpleBlock } from "./types";
import "./styles.css";
import { RasterizeMove } from "./moves/rasterize";
import { ImageLogger, ImageTest } from "./image";


const canvasSize = {
  width: 400,
  height: 400
}

const initialBlock: SimpleBlock = {
  id: "0",
  shape: [
    [0, 0],
    [canvasSize.width - 1, canvasSize.height - 1]
  ],
  color: [255, 255, 255, 1]
}

export default function App() {
  const [state, setState] = useState<{ blocks: Block[]; moves: Move[] }>({
    blocks: [
      initialBlock,
    ],
    moves: []
  })
  const [rasterizeDepth, setRasterizeDepth] = useState(1)
  return (
    <div className="App">
      <ImageLogger></ImageLogger>
      <EditorProvider
        colorBlock={async ({ blockId, color }) => {
          const result = await ColorMove({ blockId, blocks: state.blocks, color })
          setState(s => ({
            blocks: result.blocks,
            moves: s.moves.concat(result.moves)
          }))
        }}
        lineSplitBlock={async ({ blockId, orientation, point }) => {
          const result = await LineCut({
            blockId, blocks: state.blocks, orientation, point
          })
          setState(s => ({
            blocks: result.blocks,
            moves: s.moves.concat(result.moves)
          }))
        }}
        pointSplitBlock={async ({ blockId, point }) => {
          const result = await PointCut({
            blockId, blocks: state.blocks, point
          })
          setState(s => ({
            blocks: result.blocks,
            moves: s.moves.concat(result.moves)
          }))
        }}
        size={canvasSize}
        reset={() => {
          setState({
            blocks: [initialBlock],
            moves: []
          })
        }}
        rasterize={async ({ blockId, target }) => {

          const result = await RasterizeMove({ target, blockId, blocks: state.blocks })
          setState(s => ({
            blocks: result.blocks,
            moves: s.moves.concat(result.moves)
          }))
        }}
      >
        <Editor
          size={canvasSize}
          blocks={state.blocks}
        />
      </EditorProvider>
      <input style={{ marginTop: 100 }} type="number" min={1} max={20} step={1} value={rasterizeDepth} onChange={e => setRasterizeDepth(+e.target.value)} />
      <ImageTest></ImageTest>
    </div >
  );
}

