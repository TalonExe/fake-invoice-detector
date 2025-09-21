import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Use your existing Results page as App for now
import App from "./App";
import { ThemeProvider } from "@/components/theme-provider";
import Results from "./results/Results";
import UploadPage from "./results/UploadPage";
import ResultsPage from "./results/ResultsDetailsPage";
import ResultDetailPage from "./results/ResultsDetailsPage";
import { Navigate } from "react-router-dom";
import History from "./results/History";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Landing page = Results (your current App.tsx) */}
          <Route path="/" element={<App />} />
          {/* Second page = Upload (placeholder for now) */}
          <Route path="/results" element={<Results />} />
          <Route path="upload" element={<UploadPage />} /> {/* "/upload" */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="results/:id" element={<ResultDetailPage />} />{" "}
          <Route path="/history" element={<History />}></Route>
          {/* new */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
