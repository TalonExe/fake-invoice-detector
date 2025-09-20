import "./App.css";
import { ModeToggle } from "./components/ui/mode-toggle";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ---------------- Types ---------------- */
type Result = {
  id: string;
  filename: string;
  verdict: "fake" | "genuine" | "unknown";
  confidence: number;        // 0..1
  factors: string[];
  notes?: string[];
};

/* ----------- Mock data (placeholder) ----------- */
const MOCK_RESULTS: Result[] = [
  {
    id: "1",
    filename: "invoice1.pdf",
    verdict: "fake",
    confidence: 0.3,
    factors: ["Suspicious logo", "Missing address"],
    notes: [
      "Vendor not found in registry.",
      "Totals use uncommon rounding pattern.",
    ],
  },
  {
    id: "2",
    filename: "invoice2.pdf",
    verdict: "genuine",
    confidence: 0.92,
    factors: ["Consistent format", "Tax ID verified"],
    notes: ["Matches past invoices from this supplier."],
  },
  {
    id: "3",
    filename: "invoice3.png",
    verdict: "unknown",
    confidence: 0.55,
    factors: ["Low quality scan", "Insufficient features detected"],
    notes: ["Re-scan recommended for clearer OCR."],
  },
];

/* ---------------- Helpers ---------------- */
const pct = (x: number) => Math.round(x * 100);
const verdictColor = (v: Result["verdict"]) =>
  v === "genuine" ? "text-emerald-600"
  : v === "fake" ? "text-red-500"
  : "text-zinc-500";

/* Resize hook: reports {w,h} of an element */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

/* Animated number: smoothly go from previous → target */
function useAnimatedNumber(target: number, duration = 700, deps: any[] = []) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const toRef = useRef(target);

  useEffect(() => {
    fromRef.current = value;
    toRef.current = target;
    startRef.current = null;
    let raf = 0;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(fromRef.current + (toRef.current - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, ...deps]);

  return value;
}

/* Ring that RESIZES with its container and ANIMATES the sweep */
function Ring({
  percent,               // 0..100
  colorClass = "text-blue-600",
  parentWidth,           // px width of the right panel
}: {
  percent: number;
  colorClass?: string;
  parentWidth: number;
}) {
  // size ~28% of panel width, clamped between 140 and 260
  const size = Math.max(140, Math.min(260, Math.floor(parentWidth * 0.28)));
  const animated = useAnimatedNumber(percent, 800, [percent]);
  const angle = Math.max(0, Math.min(100, animated)) * 3.6;

  return (
    <div
      className={`relative ${colorClass}`}
      style={{ width: size, height: size }}
      aria-label={`Confidence ${Math.round(animated)}%`}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          backgroundImage: `conic-gradient(currentColor ${angle}deg, rgba(0,0,0,0.12) 0)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
        <span className="text-4xl font-extrabold">
          {Math.round(animated)}%
        </span>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function App() {
  const [items] = useState<Result[]>(MOCK_RESULTS);
  const [activeId, setActiveId] = useState<string>(MOCK_RESULTS[0].id);
  const active = useMemo(() => items.find((x) => x.id === activeId), [items, activeId]);

  // right panel size (for responsive ring)
  const { ref: rightRef, size: rightSize } = useSize<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Fake Invoice Detector — Results
          </h1>
          <ModeToggle />
        </div>
      </header>

    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Fake Invoice Detector — Results</h1>
        <div className="flex items-center gap-4">
          <Link to="/upload" className="underline text-blue-600">Upload</Link>
        <ModeToggle />
        </div>
      </div>
    </header>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-[380px_1fr] gap-8">
        {/* LEFT: list */}
        <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          <div className="space-y-3">
            {items.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`w-full text-left rounded-xl border p-4 transition
                  border-zinc-200 bg-white hover:bg-zinc-100
                  dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900
                  ${activeId === r.id ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className="font-medium truncate">{r.filename}</div>
                <div className={`text-sm ${verdictColor(r.verdict)}`}>
                  {r.verdict.toUpperCase()} • {pct(r.confidence)}%
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT: details */}
        <main
          ref={rightRef}
          className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {!active ? (
            <div className="text-zinc-500">Select a result</div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <Ring
                  percent={pct(active.confidence)}
                  colorClass={
                    active.verdict === "genuine"
                      ? "text-emerald-600"
                      : active.verdict === "fake"
                      ? "text-red-600"
                      : "text-blue-600"
                  }
                  parentWidth={rightSize.w}
                />
                <div>
                  <div className={`text-3xl font-extrabold ${verdictColor(active.verdict)}`}>
                    {active.verdict.toUpperCase()}
                  </div>
                  <div className="text-zinc-500 mt-1">File: {active.filename}</div>
                </div>
              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <section>
                <h3 className="text-xl font-semibold mb-3">Detection Factors</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {active.factors?.length
                    ? active.factors.map((f, i) => <li key={i}>{f}</li>)
                    : <li className="text-zinc-500">No factors provided</li>}
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Notes</h3>
                {active.notes?.length ? (
                  <ul className="list-disc pl-6 space-y-1">
                    {active.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-zinc-500">[No notes]</div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
