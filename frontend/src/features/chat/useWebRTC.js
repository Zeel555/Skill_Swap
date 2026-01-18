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
    if (localStreamRef.current) return localStreamRef.current;

    const constraints = {
      audio: true,
      video: type === "video" ? true : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    localStreamRef.current = stream;
    setCallType(type);

    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  /* ---------------- PEER ---------------- */
  const createPeerConnection = () => {
    if (peerRef.current) return;

    const pc = new RTCPeerConnection(ICE_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    localStreamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStreamRef.current)
    );

    peerRef.current = pc;
  };

  /* ---------------- CALLER ---------------- */
  const startCall = async (type = "video") => {
    await startLocalStream(type);
    createPeerConnection();

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer, callType: type });
    setCallStarted(true);
  };

  /* ---------------- RECEIVER ---------------- */
  const acceptCall = async () => {
    if (!incomingOffer || !incomingCallType) return;

    await startLocalStream(incomingCallType);
    createPeerConnection();

    await peerRef.current.setRemoteDescription(incomingOffer);

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("answer", { roomId, answer });

    setIncomingCall(false);
    setIncomingOffer(null);
    setIncomingCallType(null);
    setCallStarted(true);
  };

  const rejectCall = () => {
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
      await peerRef.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && peerRef.current) {
        await peerRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
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
