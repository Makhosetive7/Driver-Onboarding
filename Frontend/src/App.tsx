import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AdminDetailPage, AdminListPage } from './pages/AdminPages';
import { DocumentsPage } from './pages/DocumentsPage';
import { DriverDashboard } from './pages/DriverDashboard';
import { IdentityPage } from './pages/IdentityPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PersonalPage } from './pages/PersonalPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReviewPage } from './pages/ReviewPage';
import { SubmittedPage } from './pages/SubmittedPage';
import { VehiclePage } from './pages/VehiclePage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/verify" element={<VerifyOtpPage />} />
            </Route>
            <Route element={<ProtectedRoute requireVerified />}>
              <Route path="/dashboard" element={<DriverDashboard />} />
              <Route path="/onboarding/personal" element={<PersonalPage />} />
              <Route path="/onboarding/identity" element={<IdentityPage />} />
              <Route path="/onboarding/vehicle" element={<VehiclePage />} />
              <Route path="/onboarding/documents" element={<DocumentsPage />} />
              <Route path="/onboarding/review" element={<ReviewPage />} />
              <Route path="/onboarding/submitted" element={<SubmittedPage />} />
            </Route>
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminListPage />} />
              <Route path="/admin/applications/:id" element={<AdminDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
