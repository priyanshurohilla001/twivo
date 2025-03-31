import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Dashboardpage from "./pages/Dashboardpage";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { Toaster } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import UserOnboarding from "./userOnboarding/UserOnboarding";
import { UserProvider, useUser } from "./hooks/useUser";
import { SocketProvider } from "./hooks/useSocket";

export default function App() {
  return (
    <>
      <UserProvider>
        <Routes>
          <Route
            path="/"
            element={
              <HeaderBasic>
                <Homepage />
              </HeaderBasic>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <DashboardRoute>
                <Dashboardpage />
              </DashboardRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <UserOnboarding />
              </OnboardingRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </UserProvider>
    </>
  );
}

const HeaderBasic = ({ children }) => (
  <div>
    <Header />
    {children}
  </div>
);

// Base wrapper that only checks authentication
const AuthRequiredRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return children;
};
const OnboardingRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isOnboarded, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && isOnboarded === true) {
      navigate("/dashboard");
    }
  }, [isLoading, isOnboarded, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium">Loading user data...</p>
      </div>
    );
  }

  if (isOnboarded === true) {
    return null; // Prevent rendering if redirecting
  }

  return (
    <AuthRequiredRoute>
      <>
        <Header />
        {children}
      </>
    </AuthRequiredRoute>
  );
};

const DashboardRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isOnboarded, isLoading, user } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth0();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && isAuthenticated) {
      // Check if user exists and is not onboarded
      // For new users, isOnboarded might be null/undefined rather than strictly false
      if (
        isOnboarded === false ||
        isOnboarded === undefined ||
        isOnboarded === null
      ) {
        navigate("/onboarding");
      }
    }
  }, [authLoading, isAuthenticated, isLoading, isOnboarded]);

  // Show loading state when things are loading
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // If not authenticated, don't show anything (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If not onboarded, don't show anything (will redirect in useEffect)
  if (
    isOnboarded === false ||
    isOnboarded === undefined ||
    isOnboarded === null
  ) {
    return null;
  }

  // User is authenticated and onboarded, show the dashboard
  return (
    <AuthRequiredRoute>
      <SocketProvider>{children}</SocketProvider>
    </AuthRequiredRoute>
  );
};
