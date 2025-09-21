import "@/App.css";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Updated type to match the data from your DynamoDB table
type HistoryItem = {
  receipt_id: string;
  filename: string;
  s3_url: string;
  upload_timestamp: string;
};

export default function HistoryPage() {
  // Make this page ignore the centered #root and go full width
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("fullbleed");
    return () => root?.classList.remove("fullbleed");
  }, []);

  // State for items, loading, errors, and the preview dialog
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/history");
        if (!response.ok) {
          throw new Error("Failed to fetch history data.");
        }
        const data: HistoryItem[] = await response.json();
        // Sort by timestamp so the newest items are on top
        data.sort(
          (a, b) =>
            new Date(b.upload_timestamp).getTime() -
            new Date(a.upload_timestamp).getTime()
        );
        setItems(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // --- Delete Functionality ---
  const deleteItem = async (id: string) => {
    // Optimistically remove the item from the UI
    const originalItems = [...items];
    setItems((prev) => prev.filter((i) => i.receipt_id !== id));

    try {
      const response = await fetch(`http://localhost:8000/history/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        // If the delete fails, revert the UI change and show an error
        setItems(originalItems);
        alert("Failed to delete the item.");
      }
    } catch {
      // Revert on network error
      setItems(originalItems);
      alert("An error occurred while trying to delete the item.");
    }
  };

  return (
    <div className="history-layout">
      <main className="history-main">
        <div className="history-container">
          <h1 className="history-title">HISTORY</h1>

          <div className="history-card">
            <ul className="history-list">
              {isLoading && (
                <li className="history-item-centered">Loading...</li>
              )}
              {error && (
                <li className="history-item-centered" style={{ color: "red" }}>
                  Error: {error}
                </li>
              )}

              {!isLoading && !error && items.length === 0 && (
                <li className="history-item-centered">No history yet.</li>
              )}

              {!isLoading &&
                !error &&
                items.map((item) => (
                  <li key={item.receipt_id} className="history-item">
                    {/* LEFT: preview + title + date */}
                    <div className="history-left">
                      <button
                        className="history-thumb"
                        title="Preview"
                        onClick={() => setPreviewSrc(item.s3_url)}
                      >
                        <img src={item.s3_url} alt={item.filename} />
                      </button>
                      <div className="history-item-details">
                        <div className="history-title-text">
                          {item.filename}
                        </div>
                        <div className="history-date-text">
                          {new Date(item.upload_timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: delete */}
                    <div className="history-actions">
                      <button
                        className="icon-button"
                        title="Delete"
                        onClick={() => deleteItem(item.receipt_id)}
                      >
                        <Trash2 size={18} strokeWidth={2.25} />
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog
        open={!!previewSrc}
        onOpenChange={(open) => !open && setPreviewSrc(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>
              {items.find((item) => item.s3_url === previewSrc)?.filename}
            </DialogDescription>
          </DialogHeader>
          {previewSrc && (
            <img src={previewSrc} alt="preview" className="dialog-img" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
