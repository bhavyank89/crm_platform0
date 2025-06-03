import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";

// Component imports
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LoginGoogle from "./components/LoginGoogle";
import Customers from "./components/Customers";
import Campaigns from "./components/Campaigns";
import Segments from "./components/Segments";
import CommunicationLogs from "./components/CommunicationLogs";
import Home from "./components/Home";
import Orders from "./components/Orders";

// Get backend URL from .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://crmplatform-production.up.railway.app";

// Page animation wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    style={{
      width: "100%",
      minHeight: "100%",
      boxSizing: "border-box",
      overflow: "visible",
    }}
  >
    {children}
  </motion.div>
);

// Protected route
const ProtectedRoute = ({ user, children }) =>
  user ? children : <Navigate to="/login" replace />;

// Redirect to dashboard if already logged in
const AuthRoute = ({ user, children }) =>
  user ? <Navigate to="/" replace /> : children;

// Animated route declarations
const AnimatedRoutes = ({ user, setUser }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <AuthRoute user={user}>
              <PageWrapper>
                <Login setUser={setUser} backendUrl={BACKEND_URL} />
              </PageWrapper>
            </AuthRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PageWrapper>
              <Home backendUrl={BACKEND_URL} />
            </PageWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute user={user}>
              <PageWrapper>
                <Signup backendUrl={BACKEND_URL} />
              </PageWrapper>
            </AuthRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Dashboard backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Dashboard backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Customers backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Campaigns backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/segments"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Segments backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Orders backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/communicationLogs"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <CommunicationLogs backendUrl={BACKEND_URL} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check for token in URL (from OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        const errorFromUrl = urlParams.get("error");

        if (errorFromUrl) {
          console.error("OAuth error:", errorFromUrl);
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        }

        if (tokenFromUrl) {
          try {
            // Validate token by fetching user info
            const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${tokenFromUrl}`
              }
            });

            if (response.ok) {
              const userData = await response.json();
              localStorage.setItem("token", tokenFromUrl);
              setUser(userData.user);
            } else {
              console.error("Invalid token from URL");
              localStorage.removeItem("token");
            }
          } catch (error) {
            console.error("Error validating token:", error);
            localStorage.removeItem("token");
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Check for stored token
          const storedToken = localStorage.getItem("token");
          if (storedToken) {
            try {
              // Validate stored token
              const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${storedToken}`
                }
              });

              if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
              } else {
                // Invalid stored token
                localStorage.removeItem("token");
                setUser(null);
              }
            } catch (error) {
              console.error("Error validating stored token:", error);
              localStorage.removeItem("token");
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, []);

  const isAuthPage = useMemo(() => {
    return location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/home";
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {!isAuthPage && user && (
        <div
          className={`h-full bg-[#F8FAFC] fixed top-0 left-0 shadow z-10 transition-all duration-300 ${collapsed ? "w-20" : "w-64"
            }`}
        >
          <Navbar
            setUser={setUser}
            user={user}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>
      )}

      <main
        className={`mainContent flex-1 bg-[#EFF3EA] transition-all duration-300 overflow-y-auto overflow-x-hidden ${!isAuthPage && user ? (collapsed ? "ml-20" : "ml-64") : ""
          }`}
        style={{ minHeight: "100vh" }}
      >
        <AnimatedRoutes user={user} setUser={setUser} />
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
    <Toaster position="top-right" />
  </Router>
);

export default App;