import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "sonner";
import { handleApiError } from "@/utils/errorHandler";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(null);
  
  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsOnboarded(true);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);
  
  // Fetch user data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      setIsOnboarded(null);
      localStorage.removeItem("user");
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/user/basicinfo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setUser(response.data);
        setIsOnboarded(true);
        localStorage.setItem("user", JSON.stringify(response.data.userInfo));
      } catch (error) {
        if (error.response?.data?.userOnboarding === false) {
          setIsOnboarded(false);
        } else {
          handleApiError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, getAccessTokenSilently]);
  
  // Function to complete user onboarding
  const completeOnboarding = async (userData) => {
    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/onboarding`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.user);
      setIsOnboarded(true);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Onboarding completed successfully!");
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        setUser,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};