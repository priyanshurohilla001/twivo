import AddFriend from "@/components/AddFriend";
import FriendRequests from "@/components/FriendRequests";
import FriendsList from "@/components/FriendsList";
import { useUser } from "@/hooks/useUser";
import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "sonner";

const DashboardHome = () => {
  const { user } = useUser();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
        <p className="mt-2">Hello {user?.name}</p>
      </div>
      <div className="flex gap-4 justify-end mb-3">
      <AddFriend/>
      <FriendRequests/>
      </div>
      <FriendsList/>
    </div>
  );
};

export default DashboardHome;
