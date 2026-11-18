import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.tsx";
import { PreferencesProvider } from "./lib/preferences.tsx";
import { SearchProvider } from "./lib/search.tsx";
import { CatalogProvider } from "./services/CatalogProvider.tsx";
import { SiteSettingsProvider } from "./services/siteSettings.tsx";
import { TeacherPortalProvider } from "./services/teacherPortal.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PreferencesProvider>
        <SiteSettingsProvider>
          <CatalogProvider>
            <TeacherPortalProvider>
              <SearchProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </SearchProvider>
            </TeacherPortalProvider>
          </CatalogProvider>
        </SiteSettingsProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  </StrictMode>,
);
