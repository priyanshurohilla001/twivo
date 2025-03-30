import { useUser } from "@/hooks/useUser";
import React, { useEffect } from "react";
import SingleFriendInList from "./SingleFriendInList";
import { useSocket } from "@/hooks/useSocket";

const FriendsList = () => {
  const { user, setUser } = useUser();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    console.log("is connected :", isConnected);
    console.log("socket instance :", socket);
  }, [socket]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user.friends
          .filter((friend) => friend.accepted)
          .map((friend, index) => (
            <SingleFriendInList friend={friend} key={index} />
          ))}
      </div>
    </div>
  );
};

export default FriendsList;
