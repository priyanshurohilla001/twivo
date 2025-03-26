import { Routes, Route} from "react-router-dom";
import Homepage from "./pages/Homepage";
import Dashboardpage from "./pages/Dashboardpage";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { Toaster } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function App() {
  return (
    <>
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
            <ProtectedRoute>
              <Dashboardpage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

const HeaderBasic = ({ children }) => (
  <div>
    <Header />
    {children}
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Trigger login when the component mounts and the user is not authenticated
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return children;
};