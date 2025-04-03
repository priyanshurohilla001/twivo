import { useUser } from "@/hooks/useUser";
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { UserX } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { handleApiError } from "@/utils/errorHandler";
import { toast } from "sonner";
import axios from "axios";
import CallButton from "./CallButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SingleFriendInList = ({ friend }) => {
  const { user, setUser } = useUser();
  const { getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleRemoveFriend = async (username) => {
    try {
      setIsLoading(true);
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
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex justify-center items-center">
      <CardHeader className="flex flex-row items-center justify-start gap-4">
        <Avatar className="relative">
          <AvatarFallback>{friend.username[0]}</AvatarFallback>
          <div className="absolute top-2 right-2">
            {friend.onlineStatus ? (
              <div className="bg-green-400 rounded-full w-2 h-2"></div>
            ) : (
              <div className="bg-red-400 rounded-full w-2 h-2"></div>
            )}
          </div>
        </Avatar>
        <h3>{friend.username}</h3>
      </CardHeader>

      <CardFooter className="flex flex-row gap-2 items-center justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <UserX />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Friend</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <strong>{friend.username}</strong> from your friends list? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={() => handleRemoveFriend(friend.username)}
                  disabled={isLoading}
                >
                  {isLoading ? "Removing..." : "Remove"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {friend.onlineStatus && <CallButton username={friend.username} />}
      </CardFooter>
    </Card>
  );
};

export default SingleFriendInList;
