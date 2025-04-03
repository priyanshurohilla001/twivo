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
  const callTimeout = useRef(null);

  useEffect(() => {
    window.addEventListener("beforeunload", endCall);
    return () => window.removeEventListener("beforeunload", endCall);
  }, []);

  useEffect(() => {
    if (!socket) return;

    iceCandidatesBuffer.current = [];

    function handleOnCall(data) {
      const { from, offer: receivedOffer } = data;

      setCall((prevState) => {
        if (prevState.callStatus !== "idle") return prevState;
        offer.current = receivedOffer;
        return {
          ...prevState,
          callStatus: "incoming",
          recipient: from,
        };
      });
    }

    async function handleCallAccepted(data) {
      console.log("answer received", data.answer);
      const { answer, from } = data;
      if (pc.current) {
        try {
          await pc.current.setRemoteDescription(answer);

          setCall((prevState) => ({
            ...prevState,
            callStatus: "connected",
            recipient: from,
          }));
        } catch (error) {
          console.error("Failed to set remote description:", error);
          endCall();
        }
      }
    }

    function handleHangup() {
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
      setCall(initialState);
    }

    const handleIceCandidate = async (data) => {
      const { candidate, from } = data;

      if (!pc.current) {
        console.warn("Received ICE candidate but no peer connection exists");
        iceCandidatesBuffer.current.push(candidate);
        return;
      }
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Failed to add ICE candidate:", e);
      }
    };

    socket.on("call", handleOnCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("hangup", handleHangup);
    socket.on("iceCandidate", handleIceCandidate);

    return () => {
      socket.off("call", handleOnCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("hangup", handleHangup);
      socket.off("iceCandidate", handleIceCandidate);

      if (call.localStream) {
        call.localStream.getTracks().forEach((track) => track.stop());
      }

      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
    };
  }, [socket]);

  const applyBufferedCandidates = async () => {
    if (!pc.current) return;

    while (iceCandidatesBuffer.current.length > 0) {
      const candidate = iceCandidatesBuffer.current.shift();
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Failed to add ICE candidate:", e);
      }
    }
  };

  async function endCall() {
    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.close();
      pc.current = null;
    }

    clearTimeout(callTimeout.current);
    offer.current = null;

    if (call.localStream) {
      call.localStream.getTracks().forEach((track) => track.stop());
    }

    iceCandidatesBuffer.current = [];

    setCall(initialState);

    if (socket && call.recipient) {
      socket.emit("hangup", {
        from: user.username,
        to: call.recipient,
      });
    }
  }

  const createPeerConnection = (recipient) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: recipient,
          from: user.username,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state changed: ${peerConnection.connectionState}`,
      );
      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        console.error("Connection failed or disconnected");
        endCall();
      }
    };

    peerConnection.ontrack = (event) => {
      const newStream = new MediaStream();
      event.streams[0]
        .getTracks()
        .forEach((track) => newStream.addTrack(track));
      setCall((prev) => ({ ...prev, remoteStream: newStream }));
    };

    return peerConnection;
  };

  async function makeCall(username) {
    if (!socket) {
      throw new Error("Socket not initialized while making a call");
    }

    if (!username) {
      throw new Error("Username is required to make a call");
    }

    const peerConnection = createPeerConnection(username);

    pc.current = peerConnection;

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    } catch (error) {
      console.log("error while getting media access :", error);
      endCall();
      return;
    }

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

    callTimeout.current = setTimeout(() => {
      if (call.callStatus === "outgoing") endCall();
    }, 30000);
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

    if (!offer.current) {
      throw new Error("Offer is required to accept a call");
    }

    // In acceptCall function, add more STUN servers like you have in makeCall:
    const peerConnection = createPeerConnection(call.recipient);

    pc.current = peerConnection;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    } catch (error) {
      console.log("error while getting media access :", error);
      endCall();
      return;
    }

    await peerConnection.setRemoteDescription(offer.current);

    await applyBufferedCandidates();

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

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
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
