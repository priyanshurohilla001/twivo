import AddFriend from "@/components/AddFriend";
import FriendsList from "@/components/FriendsList";
import { useUser } from "@/hooks/useUser";
import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "sonner";

const DashboardHome = () => {
  const { user } = useUser();

  console.log("user",user)

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
        <p className="mt-2">Hello {user?.name}</p>
      </div>
      <div className="flex gap-4">
      <AddFriend/>
      </div>
      <FriendsList/>
    </div>
  );
};

export default DashboardHome;
