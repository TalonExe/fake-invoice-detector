import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Upload</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="underline text-blue-600">Results</Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-4">
        <p>This is a placeholder upload page. Add your file input here later.</p>
        <Link to="/" className="px-4 py-2 rounded bg-blue-600 text-white inline-block">
          Back to Results
        </Link>
      </main>
    </div>
  );
}
