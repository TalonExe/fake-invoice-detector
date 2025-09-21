import React, { useState, useRef, useEffect } from "react";

// Types
interface ReceiptItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
}
interface ReceiptData {
  id: string;
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  isLegitimate?: boolean;
  confidence?: number;
  anomalies?: string[];
  riskLevel?: "low" | "medium" | "high";
}
interface AnalysisHistoryItem {
  id: string;
  timestamp: Date;
  filename: string;
  result: boolean;
  confidence: number;
}

export default function AIReceiptDetector() {
  // ---- State ----
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReceiptData | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<
    AnalysisHistoryItem[]
  >([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- History load/save ----
  useEffect(() => {
    const saved = localStorage.getItem("receiptAnalysisHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((x: any) => ({
          ...x,
          timestamp: new Date(x.timestamp),
        }));
        setAnalysisHistory(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "receiptAnalysisHistory",
      JSON.stringify(analysisHistory)
    );
  }, [analysisHistory]);

  // ---- File handlers ----
  const processFile = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  // ---- Mock analysis (keep your logic here) ----
  const analyzeReceipt = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      const isLegitimate = Math.random() > 0.5;
      const confidence = Math.random() * 40 + 60;
      const riskLevel: "low" | "medium" | "high" =
        confidence < 70 ? "high" : confidence < 85 ? "medium" : "low";
      const mock: ReceiptData = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        merchant: "Gourmet Grocery Store",
        date: new Date().toLocaleDateString(),
        total: 87.42,
        items: [
          { id: 1, description: "Organic Avocados", quantity: 4, price: 2.99, total: 11.96 },
          { id: 2, description: "Artisan Bread", quantity: 1, price: 5.99, total: 5.99 },
          { id: 3, description: "Free-Range Eggs", quantity: 1, price: 4.49, total: 4.49 },
          { id: 4, description: "Wild-Caught Salmon", quantity: 2, price: 12.99, total: 25.98 },
          { id: 5, description: "Craft Beer (6-pack)", quantity: 1, price: 14.99, total: 14.99 },
          { id: 6, description: "Dark Chocolate", quantity: 2, price: 3.99, total: 7.98 },
          { id: 7, description: "Reusable Bag", quantity: 1, price: 0.99, total: 0.99 },
          { id: 8, description: "Bottle Deposit", quantity: 1, price: 0.4, total: 0.4 },
          { id: 9, description: "Sales Tax", quantity: 1, price: 5.64, total: 5.64 },
        ],
        isLegitimate,
        confidence,
        riskLevel,
        anomalies: isLegitimate
          ? []
          : [
              "Inconsistent font usage",
              "Tax calculation doesn't match amount",
              "Missing store identification number",
            ],
      };
      setAnalysisResult(mock);
      setIsAnalyzing(false);
      setAnalysisHistory((prev) => [
        {
          id: mock.id,
          timestamp: new Date(),
          filename: selectedFile.name,
          result: isLegitimate,
          confidence,
        },
        ...prev.slice(0, 9),
      ]);
    }, 1200);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem("receiptAnalysisHistory");
  };

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  // ---- UI (normalized) ----
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Just a page title; global header/ThemeProvider handle the rest */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          AI Receipt Detector
        </h1>
        <button
          onClick={() => setShowTutorial((v) => !v)}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          {showTutorial ? "Hide Tips" : "Show Tips"}
        </button>
      </div>

      {showTutorial && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4">
          <h3 className="font-medium mb-1 text-blue-900 dark:text-blue-200">
            Tips for Best Results
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>Ensure the receipt is well‑lit and all text is visible</li>
            <li>Capture the entire receipt including merchant information</li>
            <li>Verify that totals and tax amounts are clearly visible</li>
            <li>Check for consistency in font styles and sizes</li>
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "analyze"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("analyze")}
        >
          Analyze Receipt
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "history"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("history")}
        >
          History ({analysisHistory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "analyze" ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 text-center">
            <h2 className="text-xl font-semibold mb-2">Upload Receipt</h2>
            <p className="text-zinc-500">
              Upload a receipt to verify its authenticity using AI analysis.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop (PNG, JPG, PDF up to 10MB)
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">File:</span>
                  <span className="truncate max-w-[60ch] text-zinc-800 dark:text-zinc-200">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={resetForm}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}

            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full max-w-sm h-auto object-contain border rounded-lg"
                />
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={analyzeReceipt}
                disabled={!selectedFile || isAnalyzing}
                className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Receipt"}
              </button>
            </div>
          </div>

          {analysisResult && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-center">
                Analysis Results
              </h2>

              <div
                className={`p-4 rounded-lg flex items-center justify-center ${
                  analysisResult.isLegitimate
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">
                    {analysisResult.isLegitimate
                      ? "Legitimate Receipt"
                      : "Potential Fake Detected"}
                  </div>
                  <div className="text-sm mt-1">
                    Confidence: {analysisResult.confidence?.toFixed(2)}%
                    {analysisResult.riskLevel && (
                      <>
                        {" "}
                        • Risk:{" "}
                        <span className="font-semibold capitalize">
                          {analysisResult.riskLevel}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!!analysisResult.anomalies?.length && (
                <div className="rounded-lg border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="font-medium mb-1">Anomalies Detected</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysisResult.anomalies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{analysisResult.merchant}</div>
                    <div className="text-sm text-zinc-500">
                      Date: {analysisResult.date} • Receipt ID: {analysisResult.id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${analysisResult.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-zinc-500">Total Amount</div>
                  </div>
                </div>
                <hr className="border-zinc-200 dark:border-zinc-800 my-3" />
                <div className="space-y-2">
                  {analysisResult.items.map((it) => (
                    <div className="flex justify-between text-sm" key={it.id}>
                      <div className="text-zinc-800 dark:text-zinc-200">
                        {it.description}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {it.quantity} × ${it.price.toFixed(2)} ={" "}
                        <span className="font-medium">
                          ${it.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Analyze Another
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analysis History</h2>
            {analysisHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear History
              </button>
            )}
          </div>

          {analysisHistory.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              No analysis history yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {analysisHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-4 py-3 text-sm">{formatDate(h.timestamp)}</td>
                      <td className="px-4 py-3 text-sm">{h.filename}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            h.result
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {h.result ? "Legitimate" : "Fake"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{h.confidence.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info footer card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-center mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {["Upload Receipt", "AI Analysis", "Get Results"].map((t, i) => (
            <div key={i} className="p-4">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-semibold">
                  {i + 1}
                </span>
              </div>
              <div className="font-medium">{t}</div>
              <div className="text-sm text-zinc-500">
                {i === 0
                  ? "Upload an image or PDF of your receipt for analysis."
                  : i === 1
                  ? "We examine patterns, formatting, and content for authenticity."
                  : "Receive a quick report about legitimacy."}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
