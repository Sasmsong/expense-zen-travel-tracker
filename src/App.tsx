import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const Settings = lazy(() => import("./pages/Settings"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const MigrationGate = () => {
  useEffect(() => {
    (async () => {
      try {
        const { SecureExpenseStorage } = await import('@/utils/secureStorage');
        await SecureExpenseStorage.migrateToSecureStorage();
      } catch (e) {
        console.warn('Secure storage migration skipped:', e);
      }
    })();
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <MigrationGate />
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/trip/:tripId" element={<TripDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/legacy" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
