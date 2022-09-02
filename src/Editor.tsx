import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  useMemo,
  MouseEvent
} from "react";
import { Block, SimpleBlock, ComplexBlock, Color } from "./types";

export interface EditorContext {
  selectedBlockIds: string[];
  color: Color;
  selectColor: (color: Color) => void;
  selectBlock: (blockId: string) => void;
  deselectBlock: (blockId: string) => void;
  tool: Tool | null;
}
export const editorCtx = createContext<EditorContext>({
  selectedBlockIds: [],
  color: [0, 0, 0, 1],
  selectColor: () => {},
  selectBlock: () => {},
  deselectBlock: () => {},
  tool: null
});

export function useEditor() {
  return useContext(editorCtx);
}

export function EditorProvider({ children }: PropsWithChildren<unknown>) {
  const [selectedBlockIds, setSelectedBlockIds] = useState<
    EditorContext["selectedBlockIds"]
  >([]);
  const [color, setColor] = useState<EditorContext["color"]>([0, 0, 0, 1]);
  const value = useMemo<EditorContext>(() => {
    return {
      selectedBlockIds,
      selectBlock: (id) => {
        console.log("select", id);
        setSelectedBlockIds(Array.from(new Set(selectedBlockIds.concat(id))));
      },
      deselectBlock: (id) =>
        setSelectedBlockIds(selectedBlockIds.filter((i) => i !== id)),
      color,
      selectColor: setColor,
      tool: null
    };
  }, [selectedBlockIds, color]);
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
    <EditorProvider>
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
    </EditorProvider>
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
  const { selectedBlockIds, selectBlock, deselectBlock } = useEditor();
  const isSelected = !!selectedBlockIds.find((id) => id === block.id);
  const toggleBlock = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    console.log("toggle", block);
    if (isSelected) {
      deselectBlock(block.id);
    } else {
      selectBlock(block.id);
    }
  };
  console.log("isSelected", isSelected, block.id);
  if ("color" in block) {
    return (
      <SimpleBlockRenderer
        block={block}
        selected={isSelected}
        onClick={toggleBlock}
      />
    );
  }
  return (
    <ComplexBlockRenderer
      block={block}
      selected={isSelected}
      onClick={toggleBlock}
    />
  );
}

function ComplexBlockRenderer({
  block: {
    id,
    shape: [p1, p2],
    children
  },
  selected,
  onClick
}: {
  block: ComplexBlock;
  selected?: boolean;
  onClick: () => void;
}) {
  const w = p2[0] - p1[0];
  const h = p2[1] - p1[1];
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: p1[0],
        bottom: p1[1],
        width: w,
        height: h,
        boxSizing: "content-box",
        border: selected ? "2px solid red" : "1px solid gray",
        zIndex: selected ? 1 : undefined
      }}
    >
      {children.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function SimpleBlockRenderer({
  block: {
    id,
    color: [r, g, b, a],
    shape: [p1, p2]
  },
  selected,
  onClick
}: {
  block: SimpleBlock;
  selected?: boolean;
  onClick: () => void;
}) {
  const w = p2[0] - p1[0];
  const h = p2[1] - p1[1];
  return (
    <div
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
}

enum Tool {
  "LineCut",
  "PointCut",
  "Color",
  "Swap",
  "Merge"
}

export function Tools() {
  const { tool } = useEditor();
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
            onClick={() => setSelectedTool(Tool.LineCut)}
          >
            Line Cut
          </button>
        </li>
        <li>
          <button onClick={() => setSelectedTool(Tool.PointCut)}>
            Point Cut
          </button>
        </li>
        <li>
          <button onClick={() => setSelectedTool(Tool.Color)}>Color</button>
        </li>
        <li>
          <button onClick={() => setSelectedTool(Tool.Swap)}>Swap</button>
        </li>
        <li>
          <button onClick={() => setSelectedTool(Tool.Merge)}>Merge</button>
        </li>
      </ul>
    </div>
  );
}
