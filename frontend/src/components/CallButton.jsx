import React from "react";
import { Button } from "./ui/button";
import { PhoneCall, PhoneOff } from "lucide-react";
import { useCall } from "@/hooks/useCall";

const CallButton = ({ username }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { makeCall } = useCall();



  return (
    <div>
      <Button
        disabled={isLoading}
        onClick={() => {
          makeCall(username);
        }}
      >
        <PhoneCall className="mr-2 h-4 w-4" />
        Call
      </Button>
    </div>
  );
};

export default CallButton;
