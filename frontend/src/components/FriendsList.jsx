import { useUser } from "@/hooks/useUser";
import { handleApiError } from "@/utils/errorHandler";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserIcon, UserX } from "lucide-react";
import { toast } from "sonner";

const FriendsList = () => {
  const { user , setUser } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const [friends, setFriends] = useState(user?.friends || []);
  const [loading, setLoading] = useState(false);

  const handleRemoveFriend = async(username) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/friend/remove`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      setUser(response.data.user);
    } catch (error) {
      handleApiError(error)
    }finally{
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-lg p-4 bg-muted/20">
        <p className="text-muted-foreground">No Friends Found. Consider Adding Them 😏</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friendItem) => {
          const isOnline = Math.random() > 0.5; // Randomly set online status for demo

          if (!friendItem.accepted) {
            return null; 
          }
          
          return (
            <Card 
              key={friendItem._id} 
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-background">
                    <AvatarImage 
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${friendItem.username}`} 
                      alt={friendItem.username} 
                    />
                    <AvatarFallback>
                      <UserIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="font-semibold text-lg">{friendItem.username}</h3>
                  <div className="flex items-center gap-2">
                    {friendItem.accepted ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                        {isOnline ? "Online" : "Offline"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 w-fit">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="text-sm text-muted-foreground">
                  {isOnline ? "Currently active" : "Last seen recently"}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2 pb-4">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleRemoveFriend(friendItem.username)}
                  className="gap-1"
                >
                  <UserX className="h-4 w-4" />
                  Remove
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsList;