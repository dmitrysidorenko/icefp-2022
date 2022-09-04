import { observer } from "mobx-react-lite";
import { MouseEventHandler, useRef, useCallback, useEffect } from "react";
import tinycolor2 from "tinycolor2";
import { Tool, useEditorState } from "./state";
import {
  Block,
  SimpleBlock,
  Color,
  Point,
} from "./types";

const Editor = observer(() => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Tools />
      <CanvasRenderer />
      <KeyboardListener />
    </div>
  );
});

export default Editor;

const CanvasRenderer = observer(() => {
  const state = useEditorState();
  const ref = useRef<HTMLDivElement>(null);

  const trackHandler = useCallback<MouseEventHandler>((e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const newPoint: Point = [e.clientX - rect.left, e.clientY - rect.top];
      state.setPoint(newPoint);
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={trackHandler}
      className="Canvas canvas"
      style={{
        position: "relative",
        width: state.size.width,
        height: state.size.height,
      }}
    >
      {state.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
      <PointDebugger />
      <CrossSection />
      <CoverImage />
    </div>
  );
});

const PointDebugger = observer(() => {
  const state = useEditorState();
  return (
    <div
      style={{
        position: "absolute",
        bottom: -20,
        left: 0,
      }}
    >
      ({state.point[0]}, {state.point[1]})
    </div>
  );
});

const CoverImage = observer(() => {
  const state = useEditorState();

  return (
    <>
      {state.targetUrl && (
        <img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            opacity: state.opacity,
            pointerEvents: "none",
          }}
          src={state.targetUrl}
        />
      )}

      <div className="CoverImage_controls">
        <input
          accept="image/*"
          type="file"
          id="imgInp"
          onChange={(evt) => {
            const file = evt.target.files?.item(0);
            if (file) {
              state.setTargetFile(file);
            }
          }}
        />
        <label style={{ display: "flex" }}>
          Opacity
          <input
            type="range"
            step={0.1}
            min={0}
            max={1}
            value={state.opacity}
            onChange={(e) => state.setOpacity(+e.target.value)}
          />
        </label>
      </div>
    </>
  );
});

const BlockRenderer = observer(({ block }: { block: Block }) => {
  return <SimpleBlockRenderer block={block} />;
});

const SimpleBlockRenderer = observer(
  ({
    block: {
      id,
      color: [r, g, b, a],
      shape: [p1, p2],
    },
  }: {
    block: SimpleBlock;
  }) => {
    const state = useEditorState();
    const w = p2[0] - p1[0];
    const h = p2[1] - p1[1];
    return (
      <div
        data-id={id}
        onClick={(e) => {
          e.stopPropagation();
          state.handleBlockClick(id);
        }}
        className="block"
        style={{
          position: "absolute",
          left: p1[0],
          bottom: p1[1],
          width: w,
          height: h,
          background: `rgb(${r} ${g} ${b} / ${a})`,
        }}
      ></div>
    );
  }
);

function KeyboardListener() {
  const state = useEditorState();
  const keysMap: { [key: string]: Tool } = {
    "1": "VerticalSplit",
    "2": "HorizontalSplit",
    "3": "PointCut",
    "4": "Color",
    "5": "Rasterize",
  };
  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      const tool = keysMap[e.key];
      if (tool) {
        state.setTool(tool);
      }
    };

    document.addEventListener("keypress", cb);
    return () => {
      document.removeEventListener("keypress", cb);
    };
  }, []);
  return null;
}

export const Tools = observer(() => {
  const state = useEditorState();
  return (
    <div>
      <ul
        className="tools"
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <li>
          <button
            className={classNames(
              "tool-btn",
              state.tool === "VerticalSplit" && "selected"
            )}
            onClick={() => state.setTool("VerticalSplit")}
          >
            ┃ (1)
          </button>
        </li>
        <li>
          <button
            className={classNames(
              "tool-btn",
              state.tool === "HorizontalSplit" && "selected"
            )}
            onClick={() => state.setTool("HorizontalSplit")}
          >
            ━ (2)
          </button>
        </li>
        <li>
          <button
            className={classNames(
              "tool-btn",
              state.tool === "PointCut" && "selected"
            )}
            onClick={() => state.setTool("PointCut")}
          >
            ┼ (3)
          </button>
        </li>
        <li>
          <button
            className={classNames(
              "tool-btn",
              state.tool === "Color" && "selected"
            )}
            onClick={() => state.setTool("Color")}
          >
            💅 (4)
          </button>
          <input
            type="color"
            onChange={(e) => {
              console.log(e.target.value);
              const c = tinycolor2(e.target.value);
              if (c.isValid()) {
                const { r, g, b, a } = c.toRgb();
                const newColor: Color = [r, g, b, a];
                state.setColor(newColor);
              }
            }}
            value={`#${tinycolor2({
              r: state.color[0],
              g: state.color[1],
              b: state.color[2],
              a: state.color[3],
            }).toHex()}`}
          />
        </li>
        <li>
          <button
            className={classNames(
              "tool-btn",
              state.tool === "Rasterize" && "selected"
            )}
            onClick={() => state.setTool("Rasterize")}
          >
            Rasterize (5)
          </button>
        </li>
        <li>
          <button
            className={classNames("tool-btn")}
            onClick={() => state.reset()}
          >
            RESET
          </button>
        </li>
        {/* <li>
          <button onClick={() => selectTool(Tool.Swap)}>Swap</button>
        </li>
        <li>
          <button onClick={() => selectTool(Tool.Merge)}>Merge</button>
        </li> */}
      </ul>
    </div>
  );
});

const CrossSection = observer(() => {
  const state = useEditorState();

  return (
    <>
      {/* x */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: state.point[1],
          pointerEvents: "none",
          height: 1,
          background: "black",
        }}
      ></div>
      {/* y */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: state.point[0],
          pointerEvents: "none",
          width: 1,
          background: "black",
        }}
      ></div>
    </>
  );
});

function classNames(...classes: (string | null | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
