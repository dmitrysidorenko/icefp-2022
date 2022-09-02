import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  useMemo,
  MouseEvent,
  MouseEventHandler,
  useRef,
  forwardRef,
  useCallback,
} from "react";
import { Block, SimpleBlock, Color, Point, Orientation } from "./types";

export interface EditorContext {
  size: {
    width: number;
    height: number;
  };
  color: Color;
  selectColor: (color: Color) => void;
  tool: Tool | null;
  selectTool: (tool: Tool) => void;
  colorBlock: (options: { blockId: string; color: Color }) => void;
  lineSplitBlock: (options: {
    blockId: string;
    point: Point;
    orientation: Orientation;
  }) => void;
  pointSplitBlock: (options: { blockId: string; point: Point }) => void;
}

export const editorCtx = createContext<EditorContext>({
  size: {
    width: 0,
    height: 0
  },
  color: [0, 0, 0, 1],
  selectColor: () => { },
  tool: null,
  selectTool: () => { },
  lineSplitBlock: () => { },
  pointSplitBlock: () => { },
  colorBlock: () => { },
});

export function useEditor() {
  return useContext(editorCtx);
}

export function EditorProvider({
  children,
  lineSplitBlock,
  pointSplitBlock: pintSplitBlock,
  colorBlock,
  size
}: PropsWithChildren<
  Pick<EditorContext, "colorBlock" | "lineSplitBlock" | "pointSplitBlock" | 'size'>
>) {
  const [color, setColor] = useState<EditorContext["color"]>([0, 0, 0, 1]);
  const [tool, setTool] = useState<EditorContext["tool"]>(null);
  const value = useMemo<EditorContext>(() => {
    return {
      color,
      selectColor: setColor,
      tool,
      selectTool: setTool,
      lineSplitBlock,
      pointSplitBlock: pintSplitBlock,
      colorBlock,
      size
    };
  }, [color, tool, size]);
  return <editorCtx.Provider value={value}>{children}</editorCtx.Provider>;
}

export interface EditorProps {
  blocks: Block[];
  size: {
    width: number;
    height: number;
  };
}

export default function Editor({ blocks, size }: EditorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <p>Editor</p>
      <Tools />
      <CanvasRenderer blocks={blocks} size={size} />
    </div>
  );
}

function CanvasRenderer({
  blocks,
  size: { width, height },
}: {
  blocks: Block[];
  size: { width: number; height: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<Point>([0, 0])
  const trackHandler = useCallback<MouseEventHandler>((e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const newPoint: Point = [
        e.clientX - rect.left,
        e.clientY - rect.top
      ]
      setPoint(newPoint)
    }

  }, [])
  return (
    <div
      ref={ref}
      onMouseMove={trackHandler}
      className="Canvas"
      style={{
        position: "relative",
        width,
        height,
        border: "1px solid gray",
        boxSizing: "content-box",
      }}
    >
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
      <div style={{
        position: 'absolute',
        bottom: -20,
        left: 0
      }}>{point[0]}, {point[1]} / {height - point[1]}</div>
      <CrossSection point={point} />
    </div>
  );
}


function BlockRenderer({ block }: { block: Block }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tool, colorBlock, lineSplitBlock, pointSplitBlock, color, size: { height } } =
    useEditor();
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (tool) {
      switch (tool) {
        case Tool.Color: {
          return colorBlock({ blockId: block.id, color });
        }
        case Tool.HorizontalSplit:
        case Tool.VerticalSplit: {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const newPoint: Point = [
              e.clientX - rect.left,
              height - (e.clientY - rect.top)
            ]
            const [x, y] = newPoint
            // const x = block.shape[0][0] + (e.clientX - rect.left);
            // const y = block.shape[1][1] + (e.clientY - rect.top);
            // debugger
            console.log('x,y', x, y, e.clientY, rect)
            return lineSplitBlock({
              blockId: block.id,
              orientation:
                tool === Tool.HorizontalSplit ? "horizontal" : "vertical",
              point: [x, y],
            });
          }
        }
      }
    }
  };
  return <SimpleBlockRenderer ref={ref} block={block} onClick={handleClick} />;
}

const SimpleBlockRenderer = forwardRef<
  HTMLDivElement,
  {
    block: SimpleBlock;
    selected?: boolean;
    onClick: MouseEventHandler;
  }
>(
  (
    {
      block: {
        id,
        color: [r, g, b, a],
        shape: [p1, p2],
      },
      selected,
      onClick,
    },
    ref
  ) => {
    const w = p2[0] - p1[0];
    const h = p2[1] - p1[1];
    return (
      <div
        ref={ref}
        data-id={id}
        onClick={onClick}
        style={{
          position: "absolute",
          left: p1[0],
          bottom: p1[1],
          width: w,
          height: h,
          background: `rgb(${r} ${g} ${b} / ${a})`,
          border: selected ? "2px solid red" : "1px solid gray",
          zIndex: selected ? 1 : undefined,
        }}
      ></div>
    );
  }
);
enum Tool {
  PointCut = "PointCut",
  VerticalSplit = "VerticalSplit",
  HorizontalSplit = "HorizontalSplit",
  Color = "Color",
}

export function Tools() {
  const { tool, selectTool } = useEditor();
  return (
    <div>
      <ul
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
            className={classNames("tool-btn", tool === Tool.VerticalSplit && "selected")}
            onClick={() => selectTool(Tool.VerticalSplit)}
          >
            Vertical Split
          </button>
        </li>
        <li>
          <button
            className={classNames("tool-btn", tool === Tool.HorizontalSplit && "selected")}
            onClick={() => selectTool(Tool.HorizontalSplit)}
          >
            Horizontal Split
          </button>
        </li>
        <li>
          <button
            className={classNames("tool-btn", tool === Tool.PointCut && "selected")}
            onClick={() => selectTool(Tool.PointCut)}>Point Cut</button>
        </li>
        <li>
          <button
            className={classNames("tool-btn", tool === Tool.Color && "selected")}
            onClick={() => selectTool(Tool.Color)}>Color</button>
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
}

function CrossSection({ point }: { point: Point }) {
  return (
    <>
      {/* x */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: point[1],
        pointerEvents: 'none',
        height: 1,
        background: 'black'
      }}></div>
      {/* y */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: point[0],
        pointerEvents: 'none',
        width: 1,
        background: 'black'
      }}></div>
    </>
  );
}

function classNames(...classes: (string | null | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}