import { Link, useLocation } from "react-router-dom";

export default function Sidebar({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Overlay backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out drawer */}
      <aside
        className={`fixed left-0 top-0 z-[100] h-full w-72 transform border-r border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 text-xl font-bold">Menu</div>
        <nav className="space-y-1 px-2 pb-6">
          <Link
            to="/"
            onClick={onClose}
            className={`block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
              pathname === "/" ? "bg-zinc-100 dark:bg-zinc-900" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/results"
            onClick={onClose}
            className={`block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
              pathname.startsWith("/results") ? "bg-zinc-100 dark:bg-zinc-900" : ""
            }`}
          >
            View Individual Results
          </Link>
        </nav>
      </aside>
    </>
  );
}
