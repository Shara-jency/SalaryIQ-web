import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@app/App";
import { AuthProvider } from "@app/AuthProvider";
import { RepositoryProvider } from "@app/RepositoryProvider";
import { QueryProvider } from "@app/QueryProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <RepositoryProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RepositoryProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
