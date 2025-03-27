import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect } from "react";

const FriendsList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [friends, setFriends] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/friend/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setFriends(response.data.friends);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  if (loading) {
    return <p>Loading ...</p>;
  }

  if (friends.length === 0) {
    return <p>No Friends Found. Consider Adding Them 😏</p>;
  }

  return <div>FriendsList</div>;
};

export default FriendsList;
