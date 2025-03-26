import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "sonner";

const DashboardHome = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchData() {
      const token = await getAccessTokenSilently();
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/user/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
      } catch (error) {
        if (error.response.data.userOnboarding === false) {
          toast.error("Please complete your onboarding process.");
        } else {
          handleApiError(error);
        }
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div>
        <img src={user.picture} alt={user.nickname} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default DashboardHome;
