import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { seedLocalStorage } from '@/data/mockData';
import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Chatbot } from '@/components/Chatbot';

// Public pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

// Protected pages
import { DashboardPage } from '@/pages/DashboardPage';
import { CasesPage } from '@/pages/CasesPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AnalyserPage } from '@/pages/AnalyserPage';
import { BillingPage } from '@/pages/BillingPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilingPage } from '@/pages/ProfilingPage';
import { FIRPage } from '@/pages/FIRPage';
import { CourtPage } from '@/pages/CourtPage';

function App() {
  useEffect(() => {
    seedLocalStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in AuthGuard + AppLayout */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analyser" element={<AnalyserPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profiling" element={<ProfilingPage />} />
          <Route path="/fir" element={<FIRPage />} />
          <Route path="/court" element={<CourtPage />} />
        </Route>
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
