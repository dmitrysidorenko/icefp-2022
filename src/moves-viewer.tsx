import { Move } from "./types";

export default function MovesViewer({ moves }: { moves: Move[] }) {
    return <div style={{ width: 400 }}>
        <textarea style={{ width: '100%', minHeight: 400 }} value={moves.map(stringifyMove).join('\n')}></textarea>
    </div>
}


export function stringifyMove(move: Move): string {
    switch (move.name) {
        case "color":
            return `color [${move.blockId}] [${move.color.join(',')}]`;
        case "lcut":
            return `cut [${move.blockId}] [${move.orientation}] [${move.orientation === 'vertical' ? move.point[0] : move.point[1]}]`;
        case "pcut":
            return `cut [${move.blockId}] [${move.point.join(',')}]`;
        case "merge":
            return `merge [${move.block1Id}] [${move.block2Id}]`;
        case "swap":
            return `swap [${move.block1Id}] [${move.block2Id}]`;
    }
}
