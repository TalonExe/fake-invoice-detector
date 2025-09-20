import "./App.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./components/ui/mode-toggle";

import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
// shadcn dialog (you already use shadcn components)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


type HistoryItem = { id: string; title: string; imageUrl: string; };

const INITIAL_ITEMS: HistoryItem[] = [
  { id: "1", title: "Placeholder #1", imageUrl: "https://picsum.photos/id/1010/800/600" },
  { id: "2", title: "Placeholder #2", imageUrl: "https://picsum.photos/id/1025/800/600" },
  { id: "3", title: "Placeholder #3", imageUrl: "https://picsum.photos/id/1035/800/600" },
];

export default function HistoryPage() {
  // Make this page ignore the centered #root and go full width
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("fullbleed");
    return () => root?.classList.remove("fullbleed");
  }, []);

  const [items, setItems] = useState<HistoryItem[]>(INITIAL_ITEMS);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="history-layout">
      <main className="history-main">
        <div className="history-container">
          <h1 className="history-title">HISTORY</h1>

          <div className="history-card">
            <ul className="history-list">
              {items.map(item => (
                <li key={item.id} className="history-item">
                  {/* LEFT: preview + title together */}
                  <div className="history-left">
                    <button
                      className="history-thumb"
                      title="Preview"
                      onClick={() => setPreviewSrc(item.imageUrl)}
                    >
                      <img src={item.imageUrl} alt={item.title} />
                    </button>
                    <div className="history-title-text">{item.title}</div>
                  </div>

                  {/* RIGHT: delete */}
                  <div className="history-actions">
                    <button className="icon-button" title="Delete" onClick={() => deleteItem(item.id)}>
                      <Trash2 size={18} strokeWidth={2.25} />   {/* was <Trash2 /> */}
                    </button>

                  </div>
                </li>

              ))}

              {items.length === 0 && (
                <li className="history-item" style={{ justifyContent: "center", color: "#888" }}>
                  No history yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>

      {/* preview modal */}
      <Dialog open={!!previewSrc} onOpenChange={(open) => !open && setPreviewSrc(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>Click outside to close.</DialogDescription>
          </DialogHeader>
          {previewSrc && <img src={previewSrc} alt="preview" className="dialog-img" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// export default App;

  // return (
  //   <>
  //     <ModeToggle></ModeToggle>
  //     <div className="">
  //       <h1>Fake Invoice/Receipt Generator</h1>
  //       <div className="grid w-full max-w-sm items-center gap-3">
  //         <Label htmlFor="picture">Picture</Label>
  //         <Input id="picture" type="file" />
  //       </div>
  //     </div>
  //   </>
  // );