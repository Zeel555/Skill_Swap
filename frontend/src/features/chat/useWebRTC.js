import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";

// Enhanced ICE configuration for better connectivity (local network + internet)
const ICE_CONFIG = {
  iceServers: [
    // Google STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // Additional STUN servers for better connectivity
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    // TURN servers (for NAT traversal - you can add your own TURN server here)
    // Note: Free TURN servers are limited. For production, use a paid TURN service
    // Example: { urls: "turn:your-turn-server.com:3478", username: "user", credential: "pass" }
  ],
  iceCandidatePoolSize: 10
};

// Helper function to check if media devices are available
const checkMediaDevicesAvailable = () => {
  // Check if we're in a secure context
  const isSecureContext = window.isSecureContext || 
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isSecureContext) {
    return {
      available: false,
      error: "Media access requires HTTPS or localhost. Please access via http://localhost:5173 or set up HTTPS."
    };
  }

  // Check if getUserMedia is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      available: false,
      error: "Your browser doesn't support camera/microphone access. Please use a modern browser (Chrome, Firefox, Edge)."
    };
  }

  return { available: true };
};

const useWebRTC = (roomId) => {
  const socket = useSocket();
  
  // Debug: Log socket state
  useEffect(() => {
    if (socket) {
      console.log("🔌 Socket state - Connected:", socket.connected, "ID:", socket.id, "Room:", roomId);
    } else {
      console.warn("⚠️ Socket is null in useWebRTC");
    }
  }, [socket, roomId]);

  // Check media devices availability on mount
  useEffect(() => {
    const check = checkMediaDevicesAvailable();
    if (!check.available) {
      console.warn("⚠️ Media devices not available:", check.error);
    } else {
      console.log("✅ Media devices available");
    }
  }, []);

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
      console.log("🟢 Joining call room:", roomId, "| Socket ID:", socket.id, "| Socket connected:", socket.connected);
      socket.emit("join-call", roomId);
      
      // Verify room join after a short delay
      setTimeout(() => {
        console.log("🔍 Verifying room join for:", roomId);
      }, 500);
    }
  }, [socket, roomId]);

  /* ---------------- MEDIA ---------------- */
  const startLocalStream = async (type = "video") => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Check for legacy API
        const getUserMedia = navigator.mediaDevices?.getUserMedia ||
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        if (!getUserMedia) {
          const errorMsg = "Your browser doesn't support camera/microphone access. Please use Chrome, Firefox, or Edge.";
          console.error("❌", errorMsg);
          alert(errorMsg);
          throw new Error(errorMsg);
        }

        // Check if page is in secure context
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          const errorMsg = "Camera/microphone access requires HTTPS or localhost. Please access the app via localhost or set up HTTPS.";
          console.error("❌", errorMsg);
          alert(errorMsg + "\n\nTry accessing via: http://localhost:5173");
          throw new Error(errorMsg);
        }
      }

      if (localStreamRef.current) {
        // Stop existing tracks if switching call types
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user" } : false,
      };

      console.log("🎥 Requesting media access:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Media access granted");

      localStreamRef.current = stream;
      setCallType(type);

      if (localVideoRef.current && type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      
      let errorMessage = `Failed to access ${type === "video" ? "camera/microphone" : "microphone"}. `;
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera/microphone permissions in your browser settings and try again.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage += "No camera/microphone found. Please connect a device and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage += "Camera/microphone is being used by another application. Please close it and try again.";
      } else if (error.message.includes("secure context")) {
        errorMessage += "Please access the app via localhost or HTTPS.";
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
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
      if (pc.iceConnectionState === "failed") {
        console.error("❌ ICE connection failed - may need TURN server for NAT traversal");
        alert("Connection failed. If on different networks, you may need a TURN server.");
      } else if (pc.iceConnectionState === "disconnected") {
        console.warn("⚠️ Connection disconnected");
      } else if (pc.iceConnectionState === "connected") {
        console.log("✅ ICE connection established");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("🔗 Peer connection state:", pc.connectionState);
      if (pc.connectionState === "failed") {
        console.error("❌ Peer connection failed");
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
      // Check media devices availability first
      const mediaCheck = checkMediaDevicesAvailable();
      if (!mediaCheck.available) {
        alert(mediaCheck.error + "\n\nFor network access, you may need to:\n1. Use HTTPS\n2. Or access via localhost on each device");
        return;
      }

      if (!socket || !roomId) {
        console.error("❌ Socket or roomId not available", { socket: !!socket, roomId, socketConnected: socket?.connected });
        alert("Socket not connected. Please refresh the page.");
        return;
      }

      if (!socket.connected) {
        console.error("❌ Socket not connected");
        alert("Socket not connected. Please refresh the page.");
        return;
      }

      console.log("📞 Starting call - Type:", type, "Room:", roomId, "Socket ID:", socket.id);
      
      // Ensure we're in the room
      socket.emit("join-call", roomId);
      
      await startLocalStream(type);
      createPeerConnection();

      const offer = await peerRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === "video",
      });
      await peerRef.current.setLocalDescription(offer);

      console.log("📞 Sending offer - Room:", roomId, "Type:", type, "Socket connected:", socket.connected);
      socket.emit("offer", { roomId, offer, callType: type });
      console.log("✅ Offer sent");
      setCallStarted(true);
    } catch (error) {
      console.error("❌ Error starting call:", error);
      alert(`Failed to start call: ${error.message}`);
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
      // Check media devices availability first
      const mediaCheck = checkMediaDevicesAvailable();
      if (!mediaCheck.available) {
        alert(mediaCheck.error + "\n\nFor network access, you may need to:\n1. Use HTTPS\n2. Or access via localhost on each device");
        rejectCall();
        return;
      }

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
    if (!socket) {
      console.log("⚠️ Socket not available for event listeners");
      return;
    }

    console.log("🔌 Setting up socket listeners for room:", roomId);

    const handleOffer = ({ offer, from, callType: incomingType }) => {
      console.log("📞 Incoming call received! From:", from, "Type:", incomingType, "Room:", roomId);
      setIncomingOffer(offer);
      setIncomingCallType(incomingType || "video");
      setIncomingCall(true);
    };

    socket.on("offer", handleOffer);

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
      console.log("🧹 Cleaning up socket listeners");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [socket, roomId]);

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
