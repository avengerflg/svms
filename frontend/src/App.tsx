import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { UserRole } from "./types";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in older versions)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/visitors"
                element={
                  <ProtectedRoute>
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Visitors Page</h1>
                      <p>Visitor management features coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checkin"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      UserRole.SECURITY_GUARD,
                      UserRole.FRONT_DESK,
                      UserRole.SCHOOL_ADMIN,
                      UserRole.SUPER_ADMIN,
                    ]}
                  >
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Check-In/Out Page</h1>
                      <p>Check-in/out features coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]}
                  >
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Reports Page</h1>
                      <p>Reports and analytics coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]}
                  >
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Settings Page</h1>
                      <p>Settings and configuration coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        404
                      </h1>
                      <p className="text-gray-600 mb-4">Page not found</p>
                      <a
                        href="/dashboard"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        Go back to dashboard
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
