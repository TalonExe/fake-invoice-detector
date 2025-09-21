import React, { useState, useRef, useEffect } from "react";

// --- Type definitions for AWS Rekognition API response ---
interface BoundingBox {
  Width: number;
  Height: number;
  Left: number;
  Top: number;
}

interface Point {
  X: number;
  Y: number;
}

interface Geometry {
  BoundingBox: BoundingBox;
  Polygon: Point[];
}

interface TextDetection {
  Id: number;
  ParentId?: number;
  DetectedText: string;
  Type: "LINE" | "WORD";
  Confidence: number;
  Geometry: Geometry;
}

const AIInvoiceDetector: React.FC = () => {
  // --- State management ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // State to hold the array of detected text objects from the API
  const [analysisResult, setAnalysisResult] = useState<TextDetection[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects and Handlers ---

  // Toggles and applies dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handles file processing and preview generation
  const processFile = (file: File) => {
    setSelectedFile(file);
    setError(null); // Clear previous errors

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- API Call to Backend ---
  const analyzeInvoice = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze the invoice.");
      }

      const result = await response.json();
      setAnalysisResult(result.text_detections);
    } catch (err: unknown) {
      console.error("Error analyzing invoice:", err);
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resets the component state
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          AI Invoice Text Extractor
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* --- Upload Section --- */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                Upload Invoice
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Upload an image of an invoice to extract the text.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
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
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16a4 4 0 01-4 4H7z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, etc.
                </p>
              </div>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={resetForm}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="mt-6 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Invoice preview"
                    className="w-full max-w-xs h-auto object-contain border rounded-lg"
                  />
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={analyzeInvoice}
                  disabled={!selectedFile || isAnalyzing}
                  className="px-6 py-3 rounded-lg font-medium text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? "Analyzing..." : "Extract Text"}
                </button>
              </div>
            </div>

            {/* --- Error Display --- */}
            {error && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center"
                  role="alert"
                >
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              </div>
            )}

            {/* --- Simplified Results Section --- */}
            {analysisResult && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                  Extracted Text
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {analysisResult.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult
                        .filter((item) => item.Type === "LINE")
                        .map((line) => (
                          <li
                            key={line.Id}
                            className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm text-gray-800 dark:text-gray-300 font-mono"
                          >
                            {line.DetectedText}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No text was detected in the image.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2 bg-white dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                  >
                    Analyze Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInvoiceDetector;
