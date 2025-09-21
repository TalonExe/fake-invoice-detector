import { Link } from "react-router-dom";

export default function StartPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Start a session or review your past results.
      </p>

      <div className="flex gap-4">
        <Link
          to="/results"
          className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Go to Results / History
        </Link>
        {/* add more CTAs later */}
      </div>
    </div>
  );
}
