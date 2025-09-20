import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Use your existing Results page as App for now
import App from "./App";
import UploadPage from "./pages/UploadPage"; // you'll create this next
import { ThemeProvider } from "@/components/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Landing page = Results (your current App.tsx) */}
          <Route path="/" element={<App />} />
          {/* Second page = Upload (placeholder for now) */}
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
