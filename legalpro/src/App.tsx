import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { seedLocalStorage } from '@/data/mockData';
import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Chatbot } from '@/components/Chatbot';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Public pages
import { WebsitePage } from '@/pages/WebsitePage';
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
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  useEffect(() => {
    seedLocalStorage();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public website */}
          <Route path="/" element={<WebsitePage />} />

          {/* Public app pages (no auth required) */}
          <Route path="/app/login" element={<LoginPage />} />
          <Route path="/app/register" element={<RegisterPage />} />

          {/* Lawyers Near You — requires login but uses its own layout */}
          {/* <Route path="/app/home" element={<AuthGuard><HomePage /></AuthGuard>} /> */}

          {/* Protected app routes */}
          <Route
            path="/app"
            element={
              <AuthGuard>
                <AppLayout />
                <Chatbot />
              </AuthGuard>
            }
          >
            <Route path="home" element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analyser" element={<AnalyserPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profiling" element={<ProfilingPage />} />
            <Route path="fir" element={<FIRPage />} />
            <Route path="court" element={<CourtPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
