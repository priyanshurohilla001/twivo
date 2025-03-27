import { useUser } from "@/hooks/useUser";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { handleApiError } from "@/utils/errorHandler";
import { toast } from "sonner";

const FriendRequests = () => {
  const { user , setUser } = useUser();
  const {getAccessTokenSilently} = useAuth0();
  const [friendRequests, setFriendRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.friends) {
      const pendingRequests = user.friends.filter((friend) => !friend.accepted);
      setFriendRequests(pendingRequests);
    }
  }, [user]);

  const handleAccept = async(username) => {
    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/friend/accept`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.username !== username)
      );
      setUser(response.data.user);
      setOpen(false);
    } catch (error) {
      handleApiError(error)
    }finally{
      setIsLoading(false);
    }
  };

  const handleReject = async(username) => {
    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/friend/reject`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.username !== username)
      );
      setOpen(false);
    } catch (error) {
      handleApiError(error)
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full w-10 h-10"
          aria-label="Friend Requests"
        >
          <BellIcon className="h-5 w-5" />
          {friendRequests.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {friendRequests.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Friend Requests
          </DialogTitle>
          <DialogDescription>
            People who want to connect with you
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-1" />
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 py-2 pr-2">
            {friendRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <BellIcon className="mb-2 h-10 w-10 opacity-30" />
                <p>No pending friend requests</p>
                <p className="text-sm opacity-70">
                  When someone sends you a request, it will appear here
                </p>
              </div>
            ) : (
              friendRequests.map((request, index) => (
                <div
                  key={request.username}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage
                          src={
                            request.avatar ||
                            `https://avatar.vercel.sh/${request.username}`
                          }
                        />
                        <AvatarFallback>
                          {request.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold truncate">
                        {request.username}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleAccept(request.username)}
                        >
                          <CheckIcon className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleReject(request.username)}
                        >
                          <XIcon className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequests;
