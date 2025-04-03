import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "./useSocket";
import { useUser } from "./useUser";

const CallContext = createContext();

const initialState = {
  callStatus: "idle",
  recipient: null,
  localStream: null,
  remoteStream: null,
};

// idle | incoming | outgoing | connected

export function CallProvider({ children }) {
  const [call, setCall] = useState(initialState);
  const { socket } = useSocket();
  const { user } = useUser();
  const pc = useRef(null);
  const offer = useRef(null);
  const iceCandidatesBuffer = useRef([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call", async (data) => {
      const { from, offer: receivedOffer } = data;

      setCall((prevState) => ({
        ...prevState,
        callStatus: "incoming",
        recipient: from,
      }));
      offer.current = receivedOffer;
    });

    socket.on("callAccepted", async (data) => {
      console.log("answer received", data.answer);
      const { answer, from } = data;
      if (pc.current) {
        await pc.current.setRemoteDescription(answer);
      }
      setCall((prevState) => ({
        ...prevState,
        callStatus: "connected",
        recipient: from,
      }));
    });

    socket.on("hangup", () => {
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
      setCall(initialState);
    });

    const handleIceCandidate = async (data) => {
      const { candidate, from } = data;

      if (!pc.current) {
        console.warn("Received ICE candidate but no peer connection exists");
        iceCandidatesBuffer.current.push(candidate);
        return;
      }

      await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on("iceCandidate", handleIceCandidate);

    return () => {
      socket.off("call");
      socket.off("callAccepted");
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("hangup");
    };
  }, [socket]);

  const applyBufferedCandidates = async () => {
    if (!pc.current) return;

    while (iceCandidatesBuffer.current.length > 0) {
      const candidate = iceCandidatesBuffer.current.shift();
      await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  async function endCall() {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    if (call.localStream) {
      call.localStream.getTracks().forEach((track) => track.stop());
    }

    setCall(initialState);

    if (socket && call.recipient) {
      socket.emit("hangup", {
        from: user.username,
        to: call.recipient,
      });
    }
  }

  async function makeCall(username) {
    if (!socket) {
      throw new Error("Socket not initialized while making a call");
    }

    if (!username) {
      throw new Error("Username is required to make a call");
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    });

    pc.current = peerConnection;

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state changed: ${peerConnection.connectionState}`
      );
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
    };

    peerConnection.onsignalingstatechange = () => {
      console.log(`Signaling state: ${peerConnection.signalingState}`);
    };

    peerConnection.ontrack = (event) => {
      console.log("Remote track received", event.streams[0]);
      setCall((prev) => ({ ...prev, remoteStream: event.streams[0] }));
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: username,
          from: user.username,
        });
      }
    };

    // get local stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!stream) {
      throw new Error("Failed to get local stream");
    }

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("call", {
      from: user.username,
      to: username,
      offer: offer,
    });

    setCall((prevState) => ({
      ...prevState,
      callStatus: "outgoing",
      recipient: username,
      localStream: stream,
    }));
  }

  async function acceptCall() {
    if (call.callStatus !== "incoming") {
      throw new Error("Call is not incoming");
    }
    if (!call.recipient) {
      throw new Error("Recipient is required to accept a call");
    }
    if (!socket) {
      throw new Error("Socket not initialized while accepting a call");
    }

    console.log("offer in accept call:", offer.current);

    if (!offer.current) {
      throw new Error("Offer is required to accept a call");
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    pc.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: call.recipient,
          from: user.username,
        });
      }
    };

    pc.ontrack = (event) => {
      setCall((prev) => ({ ...prev, remoteStream: event.streams[0] }));
    };

    await applyBufferedCandidates();

    // get local stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!stream) {
      throw new Error("Failed to get local stream");
    }

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    await pc.setRemoteDescription(offer.current);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("callAccepted", {
      from: user.username,
      to: call.recipient,
      answer: answer,
    });

    setCall((prevState) => ({
      ...prevState,
      callStatus: "connected",
      recipient: call.recipient,
      localStream: stream,
    }));
  }

  return (
    <CallContext.Provider
      value={{
        call,
        setCall,
        makeCall,
        acceptCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
