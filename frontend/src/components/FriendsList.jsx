import { useUser } from "@/hooks/useUser";
import React, { use, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const FriendsList = () => {
  const { user } = useUser();
  const [friends, setFriends] = useState(user.friends);



  if (!friends) {
    return <div>Loading...</div>;
  }
  if (friends.length === 0) {
    return (
      <div>
        You have no friends <AddFriend>add</AddFriend>
      </div>
    );
  }
  return <div>FriendsList
    {friends.map((friend)=>(
      <div key={friend.id} className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <span>name</span>
        </div>
        <Button>Remove</Button>
      </div>
    ))}
    <AddFriend/>
  </div>;
};

export default FriendsList;

function AddFriend(){
  const [username, setUsername] = useState("");
  const { user } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const handleAddFriend = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/add-friend`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Friend added successfully");
    } catch (error) {
      handleApiError(error);
    }
  };
  return (
    <div className="flex gap-4 max-w-sm mt-4">
      <Input type="text" placeholder="Enter friend's username" />
      <Button>Add Friend</Button>
    </div>
  );
}