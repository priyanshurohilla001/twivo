import { useUser } from "@/hooks/useUser";
import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserIcon, UserX } from "lucide-react";
import { toast } from "sonner";
import SingleFriendInList from "./SingleFriendInList";

const FriendsList = () => {
  const { user, setUser } = useUser();
 

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
