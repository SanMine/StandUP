import { Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Applications from "./pages/Applications";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerDashboardDemo from "./pages/EmployerDashboardDemo";
import EmployerSettings from "./pages/EmployerSettings";
import Events from "./pages/Events";
import Interviews from "./pages/Interviews";
import Jobs from "./pages/Jobs";
import Landing from "./pages/Landing";
import Learning from "./pages/Learning";
import Mentors from "./pages/Mentors";
import PaymentPage from "./pages/PaymentPage";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import StripePaymentSuccessPage from "./pages/StripePaymentSuccessPage";
import Candidates from "./pages/Candidates";
import EmployerJobs from "./pages/EmployerJobs";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

          {/* Protected Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute requireRole="student"><Dashboard /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute requireRole="student"><Applications /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute requireRole="student"><Interviews /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute requireRole="student"><Mentors /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute requireRole="student"><Learning /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute requireRole="student"><Portfolio /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requireRole="student"><Settings /></ProtectedRoute>} />

          {/* Protected Employer routes */}
          <Route path="/employer-dashboard" element={<ProtectedRoute requireRole="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer-settings" element={<ProtectedRoute requireRole="employer"><EmployerSettings /></ProtectedRoute>} />
          <Route path="/candidates" element={<ProtectedRoute requireRole="employer"><Candidates /></ProtectedRoute>} />
          <Route path="/employer-jobs" element={<ProtectedRoute requireRole="employer"><EmployerJobs /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute requireRole="employer"><Events /></ProtectedRoute>} />

          <Route path="/stripe-payment-success" element={<StripePaymentSuccessPage />} />

          {/* Public */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<EmployerDashboardDemo />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
