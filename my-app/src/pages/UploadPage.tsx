import React, { useState, useRef } from "react";

/* --- Types from AWS Rekognition --- */
interface BoundingBox { Width: number; Height: number; Left: number; Top: number; }
interface Point { X: number; Y: number; }
interface Geometry { BoundingBox: BoundingBox; Polygon: Point[]; }
interface TextDetection {
  Id: number;
  ParentId?: number;
  DetectedText: string;
  Type: "LINE" | "WORD";
  Confidence: number;
  Geometry: Geometry;
}

/* --- Component --- */
export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // API result bits we care about
  const [detections, setDetections] = useState<TextDetection[] | null>(null);
  const [score, setScore] = useState<number | null>(null);          // 0..1
  const [verdict, setVerdict] = useState<"fake" | "genuine" | "unknown" | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [avgConf, setAvgConf] = useState<number | null>(null);      // 0..100 from Rekognition

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- Handlers ---------- */
  const processFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setDetections(null);
    setScore(null);
    setVerdict(null);
    setFactors([]);
    setNotes([]);
    setAvgConf(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetections(null);
    setScore(null);
    setVerdict(null);
    setFactors([]);
    setNotes([]);
    setAvgConf(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    const form = new FormData();
    form.append("image", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/extract-text", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setDetections(data.text_detections || []);
      setScore(typeof data.score === "number" ? data.score : null);
      setVerdict(data.verdict ?? null);
      setFactors(Array.isArray(data.factors) ? data.factors : []);
      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setAvgConf(typeof data.avg_confidence === "number" ? data.avg_confidence : null);
    } catch (e: any) {
      setError(e?.message || "Failed to analyze the invoice.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------- UI ---------- */
  const verdictColor =
    verdict === "genuine" ? "text-emerald-600"
    : verdict === "fake" ? "text-red-500"
    : "text-zinc-400";

  return (
    // NOTE: this wrapper fits into RootLayout (centered by max-w-* there).
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <h1 className="text-3xl md:text-4xl font-extrabold">AI Invoice Text Extractor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8">
        {/* Left: Upload card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-2">Upload</h2>
            <p className="text-zinc-500">Upload an image of an invoice to extract the text.</p>
          </div>

          <div className="p-6 space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
              }`}
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onChangeFile}
                className="hidden"
              />
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop (PNG, JPG, etc.)
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[70%] text-zinc-700 dark:text-zinc-300">
                  {selectedFile.name}
                </span>
                <button onClick={resetForm} className="text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            )}

            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Invoice preview"
                  className="w-full max-w-sm h-auto object-contain border rounded-lg"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={analyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analyzing..." : "Extract Text"}
              </button>
            </div>

            {error && (
              <div className="mt-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
                <strong className="font-semibold">Error: </strong>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Result summary */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold">Result</h2>

          {score == null ? (
            <p className="text-zinc-500">Run an analysis to see the score, verdict, and extracted text.</p>
          ) : (
            <>
              <div className="flex items-center gap-6">
                {/* Simple ring without layout side effects */}
                <div
                  className={`relative ${
                    verdict === "genuine"
                      ? "text-emerald-600"
                      : verdict === "fake"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                  style={{ width: 140, height: 140 }}
                >
                  {/* ring */}
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      backgroundImage: `conic-gradient(currentColor ${Math.round(
                        (Math.max(0, Math.min(1, score)) * 100) * 3.6
                      )}deg, rgba(0,0,0,0.12) 0)`,
                    }}
                  />
                  <div className="absolute inset-3 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                    <span className="text-2xl font-extrabold">{Math.round(score * 100)}%</span>
                  </div>
                </div>

                <div>
                  <div className={`text-3xl font-extrabold ${verdictColor}`}>
                    {verdict?.toUpperCase() ?? "UNKNOWN"}
                  </div>
                  <div className="text-zinc-500">
                    Avg OCR confidence:{" "}
                    {avgConf == null ? "—" : `${Math.round(avgConf)}%`}
                  </div>
                </div>
              </div>

              {!!factors.length && (
                <div>
                  <h3 className="font-medium mb-1">Detection Factors</h3>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    {factors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {!!notes.length && (
                <div>
                  <h3 className="font-medium mb-1">Notes</h3>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    {notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Extracted text list */}
          {detections && (
            <div className="pt-2">
              <h3 className="font-medium mb-2">Extracted Text</h3>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 max-h-80 overflow-y-auto">
                {detections.filter(d => d.Type === "LINE").length ? (
                  <ul className="space-y-2">
                    {detections
                      .filter(d => d.Type === "LINE")
                      .map(line => (
                        <li
                          key={line.Id}
                          className="p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-sm"
                        >
                          {line.DetectedText}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="text-zinc-500 text-sm">No lines detected.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
