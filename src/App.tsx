import "./styles.css";
import Editor from "./Editor";

export default function App() {
  return (
    <div className="App">
      <Editor
        size={{ height: 400, width: 400 }}
        blocks={[
          {
            id: "0",
            shape: [
              [0, 0],
              [400, 400]
            ],
            children: [
              {
                id: "0.0",
                shape: [
                  [0, 0],
                  [200, 200]
                ],
                color: [0, 0, 0, 1]
              },
              {
                id: "0.1",
                shape: [
                  [200, 0],
                  [400, 200]
                ],
                color: [0, 255, 0, 1]
              }
            ]
          }
        ]}
      />
    </div>
  );
}
