import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";

// pages
import StartPage from "./pages/start";       // ensure file name matches
import ResultsPage from "./pages/results";       // ensure default export exists
import UploadPage from "./pages/UploadPage";     // placeholder is fine
import ResultDetailPage from "./pages/ResultsDetailsPage";
// layout
import RootLayout from "./layouts/RootLayout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* All pages share the same layout (header + sidebar) */}
          <Route element={<RootLayout />}>
            <Route index element={<StartPage />} />                 {/* "/" */}
            <Route path="results" element={<ResultsPage />} />      {/* "/results" */}
            <Route path="upload" element={<UploadPage />} />        {/* "/upload" */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="results/:id" element={<ResultDetailPage />} />  {/* new */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
