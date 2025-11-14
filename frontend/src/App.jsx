import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import Mentors from "./pages/Mentors";
import Learning from "./pages/Learning";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerDashboardDemo from "./pages/EmployerDashboardDemo";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute requireRole="student"><Dashboard /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute requireRole="student"><Applications /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute requireRole="student"><Interviews /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute requireRole="student"><Mentors /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute requireRole="student"><Learning /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute requireRole="student"><Portfolio /></ProtectedRoute>} />
          
          {/* Protected Employer routes */}
          <Route path="/employer-dashboard" element={<ProtectedRoute requireRole="employer"><EmployerDashboard /></ProtectedRoute>} />
          
          {/* Settings - accessible by both */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Public */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<EmployerDashboardDemo />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </div>
  );
}

export default App;
