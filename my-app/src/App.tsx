import "./App.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./components/ui/mode-toggle";

function App() {
  return (
    <>
      <ModeToggle></ModeToggle>
      <div className="">
        <h1>Fake Invoice/Receipt Generator</h1>
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" type="file" />
        </div>
      </div>
    </>
  );
}

export default App;
