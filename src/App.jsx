import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { TripDetails } from "./pages/TripDetails";
import { CalendarView } from "./pages/CalendarView";
import { MapView } from "./pages/MapView";
import { AuthCallback } from "./pages/AuthCallback";

import Stories from "./pages/Stories";
import NewStory from "./pages/NewStory";
import EditStory from "./pages/EditStory";

import PublishedStories from "./pages/PublishedStories";
import PublicStory from "./pages/PublicStory";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================== */}

          {/* Landing page */}
          <Route path="/" element={<PublishedStories />} />

          {/* Public story detail */}
          <Route path="/story/:id" element={<PublicStory />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Register */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Auth Callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ===================== */}
          {/* PROTECTED ROUTES */}
          {/* ===================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stories"
            element={
              <ProtectedRoute>
                <Stories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stories/new"
            element={
              <ProtectedRoute>
                <NewStory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stories/edit/:id"
            element={
              <ProtectedRoute>
                <EditStory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
