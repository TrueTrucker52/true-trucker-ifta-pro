import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import IFTAReports from "./pages/IFTAReports";
import MileageTracker from "./pages/MileageTracker";
import ReceiptScan from "./pages/ReceiptScan";
import VehicleManagement from "./pages/VehicleManagement";
import TripManagement from "./pages/TripManagement";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import SiteTest from "./pages/SiteTest";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Demo from "./pages/Demo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import BOLManagement from "./pages/BOLManagement";
import PaymentSuccess from "./pages/PaymentSuccess";
import StoreListings from "./components/StoreListings";
import AudienceTargetedLanding from "./components/AudienceTargetedLanding";
import StorePreview from "./components/StorePreview";
import MarketingHub from "./components/MarketingHub";
import TruckingNews from "./pages/TruckingNews";
import PrivacySummary from "./pages/PrivacySummary";
import DeleteAccount from "./pages/DeleteAccount";
import DriverDashboard from "./pages/DriverDashboard";
import FleetDashboard from "./pages/FleetDashboard";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Install from "./pages/Install";
import Onboarding from "./pages/Onboarding";
import HelpCenter from "./pages/HelpCenter";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
const queryClient = new QueryClient();

const App: React.FC = () => {
  console.log('App rendering...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/ifta-reports" element={
              <ProtectedRoute>
                <IFTAReports />
              </ProtectedRoute>
            } />
              <Route path="/mileage-tracker" element={
                <ProtectedRoute>
                  <MileageTracker />
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <VehicleManagement />
                </ProtectedRoute>
              } />
              <Route path="/trips" element={
                <ProtectedRoute>
                  <TripManagement />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
            <Route path="/scan-receipt" element={
              <ProtectedRoute>
                <ReceiptScan />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/site-test" element={<SiteTest />} />
            <Route path="/bol-management" element={
              <ProtectedRoute>
                <BOLManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard">
                <Admin />
              </RoleProtectedRoute>
            } />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/store-listings" element={<StoreListings />} />
            <Route path="/audience-landing" element={<AudienceTargetedLanding />} />
            <Route path="/store-preview" element={<StorePreview />} />
            <Route path="/marketing-hub" element={<MarketingHub />} />
            <Route path="/trucking-news" element={
              <ProtectedRoute>
                <TruckingNews />
              </ProtectedRoute>
            } />
            <Route path="/privacy-summary" element={<PrivacySummary />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/driver-dashboard" element={
              <RoleProtectedRoute allowedRoles={['driver', 'admin']} redirectTo="/dashboard">
                <DriverDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/fleet-dashboard" element={
              <RoleProtectedRoute allowedRoles={['fleet_owner', 'admin']} redirectTo="/dashboard">
                <FleetDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/install" element={<Install />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
              <PWAInstallPrompt />
              
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
);
};

export default App;
