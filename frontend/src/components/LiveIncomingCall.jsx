import React from "react";
import { toast } from "sonner";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { data } from "react-router-dom";

const LiveIncomingCall = ({ data , handleEndCall , handlePickCall , t }) => {
  return (
    <Card className="w-full max-w-sm shadow-lg border animate-in fade-in-0 duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Incoming Call</CardTitle>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-gray-100 text-gray-800 font-medium">
              {data?.from?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-medium">{data?.from || "Unknown caller"}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          onClick={() => {
            handleEndCall(data);
            toast.dismiss(t);
          }}
        >
          <PhoneOff className="mr-1 h-4 w-4" />
          Decline
        </Button>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            handlePickCall(data);
            toast.dismiss(t);
          }}
        >
          <Phone className="mr-1 h-4 w-4" />
          Answer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LiveIncomingCall;
