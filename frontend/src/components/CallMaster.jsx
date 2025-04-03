import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { useCall } from "@/hooks/useCall";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallMaster = () => {
  const { call, acceptCall, endCall } = useCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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

  const toggleMute = () => {
    if (call.localStream) {
      const audioTracks = call.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (call.localStream) {
      const videoTracks = call.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

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
              <Button variant="destructive" onClick={endCall} className="px-6">
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
            <Button variant="destructive" onClick={endCall}>
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
            <Card className="w-full overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-xl">
              <CardHeader className="bg-slate-900 py-2">
                <CardTitle className="text-lg text-white flex justify-between items-center">
                  <span>{call.recipient}'s Camera</span>
                  <div className="text-sm font-normal text-slate-300">
                    Connected
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-video relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!call.remoteStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <p className="text-white text-lg">Connecting video...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Local video card - positioned overlay */}
            <Card className="absolute bottom-4 right-4 w-1/4 overflow-hidden border-2 border-primary/50 shadow-lg transition-all duration-200 hover:scale-105">
              <CardContent className="p-0 aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? "opacity-0" : ""}`}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <p className="text-white text-xs">Video off</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-primary/80 text-white px-2 py-1 rounded-sm text-xs">
                  You
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <Button
              variant="outline"
              onClick={toggleMute}
              className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>

            <Button
              variant="outline"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>

            <Button
              variant="destructive"
              onClick={endCall}
              className="px-8 py-2 rounded-full"
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
