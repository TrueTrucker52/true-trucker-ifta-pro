import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingFallback } from "@/components/PageLoadingFallback";

// ALL pages lazy-loaded (including Index and Auth)
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calculator = lazy(() => import("./pages/Calculator"));
const IFTAReports = lazy(() => import("./pages/IFTAReports"));
const MileageTracker = lazy(() => import("./pages/MileageTracker"));
const ReceiptScan = lazy(() => import("./pages/ReceiptScan"));
const VehicleManagement = lazy(() => import("./pages/VehicleManagement"));
const TripManagement = lazy(() => import("./pages/TripManagement"));
const Reports = lazy(() => import("./pages/Reports"));
const Invoices = lazy(() => import("./pages/Invoices"));
const SiteTest = lazy(() => import("./pages/SiteTest"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Account = lazy(() => import("./pages/Account"));
const Demo = lazy(() => import("./pages/Demo"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const BOLManagement = lazy(() => import("./pages/BOLManagement"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const StoreListings = lazy(() => import("./components/StoreListings"));
const AudienceTargetedLanding = lazy(() => import("./components/AudienceTargetedLanding"));
const StorePreview = lazy(() => import("./components/StorePreview"));
const MarketingHub = lazy(() => import("./components/MarketingHub"));
const TruckingNews = lazy(() => import("./pages/TruckingNews"));
const PrivacySummary = lazy(() => import("./pages/PrivacySummary"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const FleetDashboard = lazy(() => import("./pages/FleetDashboard"));
const FleetMap = lazy(() => import("./pages/FleetMap"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Install = lazy(() => import("./pages/Install"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ELD = lazy(() => import("./pages/ELD"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Learn = lazy(() => import("./pages/Learn"));

// Lazy loaded global overlays
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt"));
const TruckerAIAssistant = lazy(() => import("./components/ai-assistant/TruckerAIAssistant"));
const VoiceCommandSystem = lazy(() => import("./components/voice-commands/VoiceCommandSystem"));
const TrialConversionBanner = lazy(() => import("./components/trial/TrialConversionBanner"));
const TrialExpiryWall = lazy(() => import("./components/trial/TrialExpiryWall"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/ifta-reports" element={<ProtectedRoute><IFTAReports /></ProtectedRoute>} />
                  <Route path="/mileage-tracker" element={<ProtectedRoute><MileageTracker /></ProtectedRoute>} />
                  <Route path="/vehicles" element={<ProtectedRoute><VehicleManagement /></ProtectedRoute>} />
                  <Route path="/trips" element={<ProtectedRoute><TripManagement /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/scan-receipt" element={<ProtectedRoute><ReceiptScan /></ProtectedRoute>} />
                  <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/site-test" element={<SiteTest />} />
                  <Route path="/bol-management" element={<ProtectedRoute><BOLManagement /></ProtectedRoute>} />
                  <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard"><Admin /></RoleProtectedRoute>} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/store-listings" element={<StoreListings />} />
                  <Route path="/audience-landing" element={<AudienceTargetedLanding />} />
                  <Route path="/store-preview" element={<StorePreview />} />
                  <Route path="/marketing-hub" element={<MarketingHub />} />
                  <Route path="/trucking-news" element={<ProtectedRoute><TruckingNews /></ProtectedRoute>} />
                  <Route path="/privacy-summary" element={<PrivacySummary />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/delete-account" element={<DeleteAccount />} />
                  <Route path="/driver-dashboard" element={<RoleProtectedRoute allowedRoles={['driver', 'admin']} redirectTo="/dashboard"><DriverDashboard /></RoleProtectedRoute>} />
                  <Route path="/fleet-dashboard" element={<RoleProtectedRoute allowedRoles={['fleet_owner', 'admin']} redirectTo="/dashboard"><FleetDashboard /></RoleProtectedRoute>} />
                  <Route path="/fleet-map" element={<RoleProtectedRoute allowedRoles={['fleet_owner', 'admin']} redirectTo="/dashboard"><FleetMap /></RoleProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/eld" element={<ProtectedRoute><ELD /></ProtectedRoute>} />
                  <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Suspense fallback={null}>
                <TrialConversionBanner />
                <TrialExpiryWall />
                <PWAInstallPrompt />
                <TruckerAIAssistant />
                <VoiceCommandSystem />
              </Suspense>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
