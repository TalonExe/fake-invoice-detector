import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RESULTS_DATA } from "@/data/results";
import type { ReceiptRow, Verdict } from "@/data/results";
import { useLandscape } from "@/hooks/useLandscape";

/* helpers */
const pct = (x: number) => Math.round(x * 100);
const MYR = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
const verdictColor = (v: Verdict) =>
  v === "genuine" ? "text-emerald-600" : v === "fake" ? "text-red-500" : "text-zinc-500";

/* sizing + ring */
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
function useAnimatedNumber(target: number, duration = 700, deps: any[] = []) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const toRef = useRef(target);
  useEffect(() => {
    fromRef.current = value; toRef.current = target; startRef.current = null;
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
  }, [target, duration, ...deps]);
  return value;
}
function Ring({ percent, colorClass = "text-blue-600", parentWidth }: { percent: number; colorClass?: string; parentWidth: number; }) {
  const size = Math.max(140, Math.min(260, Math.floor(parentWidth * 0.28)));
  const animated = useAnimatedNumber(percent, 800, [percent]);
  const angle = Math.max(0, Math.min(100, animated)) * 3.6;
  return (
    <div className={`relative ${colorClass}`} style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full" style={{ backgroundImage: `conic-gradient(currentColor ${angle}deg, rgba(0,0,0,0.12) 0)` }} />
      <div className="absolute inset-3 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
        <span className="text-4xl font-extrabold">{Math.round(animated)}%</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [rows, setRows] = useState<ReceiptRow[]>(RESULTS_DATA);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(rows.length / pageSize);
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);

  const trust = Math.round((rows.reduce((s, r) => s + r.validityPct, 0) / rows.length) * 100);
  const verdictText =
    trust >= 85 ? "Very likely genuine" :
    trust >= 70 ? "Generally trustworthy" :
    trust >= 50 ? "Mixed signals — review" :
    trust >= 30 ? "Potentially suspicious" : "High risk — likely fake";

  const { ref: ringRef, size: ringSize } = useSize<HTMLDivElement>();
  const landscape = useLandscape();

  const toggleFlag = (id: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  const accept = (id: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, accepted: !r.accepted, flagged: false } : r));

  return (
    <div className="w-full space-y-8">
      <section ref={ringRef} className={`flex ${landscape ? "flex-row" : "flex-col justify-center"} items-center gap-8`}>
        <Ring
          percent={trust}
          colorClass={trust >= 70 ? "text-emerald-600" : trust >= 50 ? "text-blue-600" : "text-red-600"}
          parentWidth={ringSize.w || 800}
        />
        <div className="text-center md:text-left">
          <div className="text-3xl font-extrabold">{verdictText}</div>
          <p className="text-zinc-500 mt-1">Overall trust score based on current batch.</p>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Receipt ID</th>
              <th>Employee</th>
              <th>Location</th>
              <th>Date</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Validity %</th>
              <th>Verdict</th>
              <th className="text-center">Flag</th>
              <th className="text-center">Accept</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t [&>tr]:border-zinc-200 dark:[&>tr]:border-zinc-800">
            {pageRows.map((r) => (
              <tr key={r.id} className="[&>td]:px-3 [&>td]:py-2">
                <td className="font-medium underline text-blue-600">
                  <Link to={`/results/${r.id}`} state={{ row: r }}>{r.id}</Link>
                </td>
                <td>{r.employee}</td>
                <td>{r.location}</td>
                <td>{r.date}</td>
                <td className="text-right font-mono">{MYR.format(r.amount)}</td>
                <td className="text-right">{pct(r.validityPct)}%</td>
                <td className={verdictColor(r.verdict)}>{r.verdict.toUpperCase()}</td>
                <td className="text-center">
                  <button
                    onClick={() => toggleFlag(r.id)}
                    className={`rounded-md border px-2 py-1 text-xs transition ${
                      r.flagged
                        ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {r.flagged ? "Flagged" : "Flag"}
                  </button>
                </td>
                <td className="text-center">
                  <button
                    onClick={() => accept(r.id)}
                    className={`rounded-md border px-2 py-1 text-xs transition ${
                      r.accepted
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {r.accepted ? "Accepted" : "Accept"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
