import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const useWebRTC = (roomId) => {
  const socket = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [callStarted, setCallStarted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [incomingCallType, setIncomingCallType] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callType, setCallType] = useState(null); // "audio" | "video"

  /* ---------------- JOIN ROOM ONCE ---------------- */
  useEffect(() => {
    if (socket && roomId) {
      console.log("🟢 joining call room:", roomId);
      socket.emit("join-call", roomId);
    }
  }, [socket, roomId]);

  /* ---------------- MEDIA ---------------- */
  const startLocalStream = async (type = "video") => {
    try {
      if (localStreamRef.current) {
        // Stop existing tracks if switching call types
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user" } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;
      setCallType(type);

      if (localVideoRef.current && type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      alert(`Failed to access ${type === "video" ? "camera/microphone" : "microphone"}. Please check permissions.`);
      throw error;
    }
  };

  /* ---------------- PEER ---------------- */
  const createPeerConnection = () => {
    if (peerRef.current) {
      // Close existing connection if switching
      peerRef.current.close();
      peerRef.current = null;
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate && socket && roomId) {
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      console.log("📹 Received remote stream");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("🔌 ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        console.warn("⚠️ Connection issue detected");
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    peerRef.current = pc;
  };

  /* ---------------- CALLER ---------------- */
  const startCall = async (type = "video") => {
    try {
      if (!socket || !roomId) {
        console.error("❌ Socket or roomId not available");
        return;
      }

      await startLocalStream(type);
      createPeerConnection();

      const offer = await peerRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === "video",
      });
      await peerRef.current.setLocalDescription(offer);

      console.log("📞 Initiating call:", type, "in room:", roomId);
      socket.emit("offer", { roomId, offer, callType: type });
      setCallStarted(true);
    } catch (error) {
      console.error("❌ Error starting call:", error);
      // Clean up on error
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    }
  };

  /* ---------------- RECEIVER ---------------- */
  const acceptCall = async () => {
    try {
      if (!incomingOffer || !incomingCallType) {
        console.error("❌ No incoming offer or call type");
        return;
      }

      if (!socket || !roomId) {
        console.error("❌ Socket or roomId not available");
        return;
      }

      await startLocalStream(incomingCallType);
      createPeerConnection();

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      console.log("✅ Accepting call:", incomingCallType, "in room:", roomId);
      socket.emit("answer", { roomId, answer });

      setIncomingCall(false);
      setIncomingOffer(null);
      setIncomingCallType(null);
      setCallStarted(true);
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert("Failed to accept call. Please try again.");
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (socket && roomId) {
      // Notify the caller that the call was rejected
      socket.emit("call-rejected", { roomId });
    }
    setIncomingCall(false);
    setIncomingOffer(null);
    setIncomingCallType(null);
  };

  /* ---------------- CONTROLS ---------------- */
  const toggleMute = () => {
    localStreamRef.current.getAudioTracks().forEach(
      (t) => (t.enabled = !t.enabled)
    );
    setIsMuted((p) => !p);
  };

  const toggleCamera = () => {
    if (callType === "audio") return; // No camera for audio calls

    localStreamRef.current.getVideoTracks().forEach(
      (t) => (t.enabled = !t.enabled)
    );
    setIsCameraOff((p) => !p);
  };

  const endCall = () => {
    // Notify the other user that the call ended
    if (socket && roomId) {
      socket.emit("call-ended", { roomId });
    }

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();

    localStreamRef.current = null;
    peerRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallStarted(false);
    setIncomingCall(false);
    setIncomingOffer(null);
    setIncomingCallType(null);
    setCallType(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!socket) return;

    socket.on("offer", ({ offer, from, callType: incomingType }) => {
      console.log("📞 Incoming call from:", from, "type:", incomingType);
      setIncomingOffer(offer);
      setIncomingCallType(incomingType || "video");
      setIncomingCall(true);
    });

    socket.on("answer", async ({ answer }) => {
      try {
        if (peerRef.current && answer) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("✅ Call answered");
        }
      } catch (error) {
        console.error("❌ Error setting remote description:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (candidate && peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
      }
    });

    socket.on("call-rejected", () => {
      console.log("📞 Call was rejected");
      endCall();
      alert("Call was rejected by the other user");
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by other user");
      endCall();
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [socket]);

  return {
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    incomingCall,
    callStarted,
    isMuted,
    isCameraOff,
    callType,
    incomingCallType,
  };
};

export default useWebRTC;
