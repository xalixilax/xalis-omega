import { useState } from "react";
import { OverlayFromMask } from "./components/overlayFromMask";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <OverlayFromMask />
    </>
  );
}

export default App;
