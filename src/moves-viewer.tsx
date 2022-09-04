import { observer } from "mobx-react-lite";
import { useEditorState } from "./state";
import { Move } from "./types";

export const MovesViewer = observer(() => {
  const state = useEditorState();
  return (
    <div style={{ width: 400 }}>
      Moves cost: {state.movesCost}
      Blocks count: {state.blocks.length}
      <textarea
        style={{ width: "100%", minHeight: 400 }}
        value={state.moves.map(stringifyMove).join("\n")}
      ></textarea>
    </div>
  );
});

export function stringifyMove(move: Move): string {
  switch (move.name) {
    case "color":
      return `color [${move.blockId}] [${move.color.join(",")}]`;
    case "lcut":
      return `cut [${move.blockId}] [${
        move.orientation === "vertical" ? "x" : "y"
      }] [${move.orientation === "vertical" ? move.point[0] : move.point[1]}]`;
    case "pcut":
      return `cut [${move.blockId}] [${move.point.join(",")}]`;
    case "merge":
      return `merge [${move.block1Id}] [${move.block2Id}]`;
    case "swap":
      return `swap [${move.block1Id}] [${move.block2Id}]`;
  }
}
