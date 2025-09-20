import React, { useState, useRef, useEffect } from 'react';

// Type definitions
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
}

const AIReceiptDetector: React.FC = () => {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReceiptData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  // Process the uploaded file
  const processFile = (file: File) => {
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Simulate AI analysis
  const analyzeReceipt = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock analysis result
      const isLegitimate = Math.random() > 0.5;
      const mockResult: ReceiptData = {
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
          { id: 8, description: "Bottle Deposit", quantity: 1, price: 0.40, total: 0.40 },
          { id: 9, description: "Sales Tax", quantity: 1, price: 5.64, total: 5.64 },
        ],
        isLegitimate,
        confidence: Math.random() * 40 + 60, // Confidence between 60-100%
        anomalies: isLegitimate ? [] : [
          "Inconsistent font usage",
          "Tax calculation doesn't match amount",
          "Missing store identification number"
        ]
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Reset the form
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Header with dark mode toggle */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          AI Receipt Detector
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          )}
        </button>
      </header>

      {/* Main content - centered */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Upload Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                Upload Receipt
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Upload a receipt to verify its authenticity using AI analysis
              </p>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
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
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16h10M7 8h10m-5 12V4" />
                  </svg>
                  
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="mt-6 flex justify-center">
                  <div className="border rounded-lg overflow-hidden max-w-xs dark:border-gray-600">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={analyzeReceipt}
                  disabled={!selectedFile || isAnalyzing}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                    !selectedFile || isAnalyzing
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                  }`}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Receipt'
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {analysisResult && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                  Analysis Results
                </h2>
                
                <div className={`p-4 rounded-lg mb-6 flex items-center ${
                  analysisResult.isLegitimate 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <svg className={`h-6 w-6 mr-3 ${
                    analysisResult.isLegitimate ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      analysisResult.isLegitimate 
                        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } />
                  </svg>
                  <div>
                    <span className="font-bold">
                      {analysisResult.isLegitimate ? 'Legitimate Receipt' : 'Potential Fake Detected'}
                    </span>
                    <p className="text-sm mt-1">
                      Confidence: {analysisResult.confidence?.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Anomalies Detected */}
                {analysisResult.anomalies && analysisResult.anomalies.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Anomalies Detected
                    </h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      {analysisResult.anomalies.map((anomaly, index) => (
                        <li key={index}>{anomaly}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Receipt Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{analysisResult.merchant}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date: {analysisResult.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receipt ID: {analysisResult.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        ${analysisResult.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h4>
                    <div className="space-y-2">
                      {analysisResult.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <span className="text-gray-800 dark:text-gray-300">{item.description}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.quantity} × ${item.price.toFixed(2)} = 
                              <span className="font-medium ml-1">${item.total.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Analyze Another Receipt
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">1</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Upload Receipt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload an image or PDF of your receipt for analysis
                </p>
              </div>
              <div className="text-center p-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">2</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI examines patterns, formatting, and content for authenticity
                </p>
              </div>
              <div className="text-center p-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">3</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Get Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive a detailed report on the receipt's legitimacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIReceiptDetector;