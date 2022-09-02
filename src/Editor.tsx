import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  useMemo,
  MouseEvent,
  MouseEventHandler,
  useRef,
  forwardRef
} from "react";
import { Block, SimpleBlock, Color, Point, Orientation } from "./types";

export interface EditorContext {
  color: Color;
  selectColor: (color: Color) => void;
  tool: Tool | null;
  selectTool: (tool: Tool) => void;
  colorBlock: (options: { blockId: string, color: Color }) => void;
  lineSplitBlock: (options: { blockId: string, point: Point, orientation: Orientation }) => void;
  pointSplitBlock: (options: { blockId: string, point: Point }) => void;
}

export const editorCtx = createContext<EditorContext>({
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

export function EditorProvider({ children, lineSplitBlock, pointSplitBlock: pintSplitBlock, colorBlock }: PropsWithChildren<Pick<EditorContext, 'colorBlock' | 'lineSplitBlock' | 'pointSplitBlock'>>) {
  const [color, setColor] = useState<EditorContext["color"]>([0, 0, 0, 1]);
  const [tool, setTool] = useState<EditorContext["tool"]>(null);
  const value = useMemo<EditorContext>(() => {
    return {
      color,
      selectColor: setColor,
      tool,
      selectTool: setTool,
      lineSplitBlock, pointSplitBlock: pintSplitBlock, colorBlock
    };
  }, [color, tool]);
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
        gap: "1rem"
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
  size: { width, height }
}: {
  blocks: Block[];
  size: { width: number; height: number };
}) {
  return (
    <div
      className="Canvas"
      style={{
        position: "relative",
        width,
        height,
        border: "1px solid gray",
        boxSizing: "content-box"
      }}
    >
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  const ref = useRef<HTMLDivElement>(null)
  const { tool, colorBlock, lineSplitBlock, pointSplitBlock, color } = useEditor();
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (tool) {
      switch (tool) {
        case Tool.Color: {
          return colorBlock({ blockId: block.id, color })
        }
        case Tool.HorizontalSplit:
        case Tool.VerticalSplit: {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            return lineSplitBlock({
              blockId: block.id,
              orientation: tool === Tool.HorizontalSplit ? "horizontal" : "vertical",
              point: [
                block.shape[0][0] + (e.clientX - rect.left),
                block.shape[0][1] + (e.clientY - rect.height - rect.top)
              ]
            })
          }
        }

      }
    }
  };
  return (
    <SimpleBlockRenderer
      ref={ref}
      block={block}
      onClick={handleClick}
    />
  );
}

const SimpleBlockRenderer = forwardRef<HTMLDivElement, {
  block: SimpleBlock;
  selected?: boolean;
  onClick: MouseEventHandler;
}>(({
  block: {
    id,
    color: [r, g, b, a],
    shape: [p1, p2]
  },
  selected,
  onClick
}, ref) => {
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
        zIndex: selected ? 1 : undefined
      }}
    ></div>
  );
})
enum Tool {
  PointCut = "PointCut",
  VerticalSplit = "VerticalSplit",
  HorizontalSplit = "HorizontalSplit",
  Color = "Color"
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
          gap: "0.5rem"
        }}
      >
        <li>
          <button
            style={{
              border: tool === Tool.PointCut ? "1px solid black" : undefined
            }}
            onClick={() => selectTool(Tool.VerticalSplit)}
          >
            Vertical Split
          </button>
        </li>
        <li>
          <button
            style={{
              border: tool === Tool.PointCut ? "1px solid black" : undefined
            }}
            onClick={() => selectTool(Tool.HorizontalSplit)}
          >
            Horizontal Split
          </button>
        </li>
        <li>
          <button onClick={() => selectTool(Tool.PointCut)}>
            Point Cut
          </button>
        </li>
        <li>
          <button onClick={() => selectTool(Tool.Color)}>Color</button>
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
