import { useState } from "react";
import Editor from "./Editor";
import "./styles.css";
import { ImageLogger, ImageTest } from "./image";
import { State, StateProvider } from "./state";
import { MovesViewer } from "./moves-viewer";


export default function App() {
  const [mstate, ] = useState(() => new State());
  const [rasterizeDepth, setRasterizeDepth] = useState(1);
  return (
    <StateProvider state={mstate}>
      <div className="App">
        <ImageLogger></ImageLogger>
        <Editor />
        <input
          style={{ marginTop: 100 }}
          type="number"
          min={1}
          max={20}
          step={1}
          value={rasterizeDepth}
          onChange={(e) => setRasterizeDepth(+e.target.value)}
        />
        <ImageTest></ImageTest>
        <MovesViewer />
      </div>
    </StateProvider>
  );
}
