import { useLocation, useParams, Link } from "react-router-dom";
import { RESULTS_DATA } from "@/data/results";
import type { ReceiptRow, Verdict } from "@/data/results";
import { useEffect, useRef, useState } from "react";

const pct = (x: number) => Math.round(x * 100);
const MYR = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
const verdictColor = (v: Verdict) =>
  v === "genuine" ? "text-emerald-600" : v === "fake" ? "text-red-500" : "text-zinc-500";

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
function useAnimatedNumber(target: number, duration = 700) {
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
  }, [target, duration]);
  return value;
}
function Ring({ percent, colorClass = "text-blue-600", parentWidth }: { percent: number; colorClass?: string; parentWidth: number; }) {
  const size = Math.max(140, Math.min(260, Math.floor(parentWidth * 0.28)));
  const animated = useAnimatedNumber(percent, 800);
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

export default function ResultDetailPage() {
  const { id } = useParams();
  const location = useLocation() as { state?: { row?: ReceiptRow } };
  const initial = location.state?.row ?? RESULTS_DATA.find(r => r.id === id) ?? null;
  const [row, setRow] = useState<ReceiptRow | null>(initial);
  const { ref: ringRef, size: ringSize } = useSize<HTMLDivElement>();

  if (!row) {
    return (
      <div>
        <p className="text-zinc-500">Receipt not found.</p>
        <Link to="/results" className="underline text-blue-600">Back to Results</Link>
      </div>
    );
  }

  const toggleFlag = () => setRow(r => r ? { ...r, flagged: !r.flagged } : r);
  const toggleAccept = () => setRow(r => r ? { ...r, accepted: !r.accepted, flagged: false } : r);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Receipt {row.id}</h2>
        <Link to="/results" className="underline text-blue-600">Back to Results</Link>
      </div>

      <section ref={ringRef} className="flex items-center gap-8">
        <Ring
          percent={pct(row.validityPct)}
          colorClass={
            row.validityPct >= 0.7 ? "text-emerald-600" :
            row.validityPct >= 0.5 ? "text-blue-600" : "text-red-600"
          }
          parentWidth={ringSize.w || 800}
        />
        <div>
          <div className={`text-3xl font-extrabold ${verdictColor(row.verdict)}`}>
            {row.verdict.toUpperCase()}
          </div>
          <div className="text-zinc-500 mt-1">Amount: <span className="font-mono">{MYR.format(row.amount)}</span></div>
        </div>
      </section>

      <div className="rounded-xl border p-4 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><div className="text-sm text-zinc-500">Employee</div><div>{row.employee}</div></div>
        <div><div className="text-sm text-zinc-500">Location</div><div>{row.location}</div></div>
        <div><div className="text-sm text-zinc-500">Date</div><div>{row.date}</div></div>
        <div><div className="text-sm text-zinc-500">Validity</div><div>{pct(row.validityPct)}%</div></div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleFlag}
          className={`rounded-md border px-3 py-2 text-sm transition ${
            row.flagged
              ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          {row.flagged ? "Flagged" : "Flag"}
        </button>
        <button
          onClick={toggleAccept}
          className={`rounded-md border px-3 py-2 text-sm transition ${
            row.accepted
              ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          {row.accepted ? "Accepted" : "Accept"}
        </button>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-2">Detection Factors</h3>
        {row.factors?.length ? (
          <ul className="list-disc pl-6 space-y-1">{row.factors.map((f,i)=><li key={i}>{f}</li>)}</ul>
        ) : (
          <div className="text-sm text-zinc-500">No factors provided.</div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        {row.notes?.length ? (
          <ul className="list-disc pl-6 space-y-1">{row.notes.map((n,i)=><li key={i}>{n}</li>)}</ul>
        ) : (
          <div className="text-sm text-zinc-500">[No notes]</div>
        )}
      </section>
    </div>
  );
}
