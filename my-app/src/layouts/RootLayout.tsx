import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Sidebar from "@/components/ui/Sidebar";

export default function RootLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Sidebar (above everything) */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* HEADER */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(o => !o)}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <Link to="/" className="text-xl md:text-2xl font-extrabold tracking-tight">
              Fake Invoice Detector
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/results" className="underline text-blue-600">Results</Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="py-8">
        <div className="w-full max-w-6xl px-4 md:px-8 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
