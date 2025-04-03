import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { useCall } from "@/hooks/useCall";

const CallMaster = () => {
  const { call, acceptCall, endCall } = useCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  console.log("call in CallMaster:", call);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = call.localStream;
    }
  }, [call.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = call.remoteStream;
    }
  }, [call.remoteStream]);

  if (call.callStatus === "idle") {
    return (
      <div className="call-status-container">
        <h1>No active calls</h1>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* 3. Outgoing call section */}
      {call.callStatus === "outgoing" && (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">Calling {call.recipient}</h1>
          <Card className="w-full max-w-lg overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-center">Your Camera</CardTitle>
            </CardHeader>
            <CardContent className="p-0 aspect-video relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                You
              </div>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              <Button
                variant="destructive"
                onClick={endCall}
                className="px-6"
              >
                Cancel Call
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 4. Incoming call section */}
      {call.callStatus === "incoming" && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Incoming Call from {call.recipient}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-center gap-4 p-6">
            <Button
              variant="default"
              onClick={acceptCall}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={endCall}
            >
              Reject
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 5. Active call section */}
      {call.callStatus === "connected" && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-center">
            In Call with {call.recipient}
          </h1>
          <div className="grid grid-cols-1 gap-4 relative">
            {/* Remote video card */}
            <Card className="w-full overflow-hidden bg-slate-800 border-2 border-slate-700">
              <CardHeader className="bg-slate-900 py-2">
                <CardTitle className="text-lg text-white">
                  {call.recipient}'s Camera
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </CardContent>
            </Card>
            
            {/* Local video card - positioned overlay */}
            <Card className="absolute bottom-4 right-4 w-1/4 overflow-hidden border-2 border-white shadow-lg">
              <CardHeader className="bg-primary py-1">
                <CardTitle className="text-sm text-white text-center">
                  Your Camera
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button
              variant="destructive"
              onClick={endCall}
              className="px-8 py-6 text-lg"
            >
              End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallMaster;
