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
import { CallProvider } from "./hooks/useCall";

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
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const { user, isLoading: userLoading } = useUser();
  const navigate = useNavigate();

  // step 1 : logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
      return;
    }
  }, [isAuthenticated]);

  // step 2 : user in db (for onboarding)
  useEffect(() => {
    if (!userLoading && !user) navigate("/onboarding");
  }, [user]);

  if (isLoading || userLoading) {
    return (
      <div>
        <h1>Dashboard is loading ...</h1>
      </div>
    );
  }

  console.log(
    "user in test :",
    user,
    " auth loading :",
    isLoading,
    " user loading :",
    userLoading,
    " authenticated status :",
    isAuthenticated
  );

  if (!user) return null;

  return (
    <SocketProvider>
      <CallProvider>{children}</CallProvider>
    </SocketProvider>
  );
};
