import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import useWebRTC from "./useWebRTC";

const VideoCall = forwardRef(({ roomId, onCallStateChange, selectedUser }, ref) => {
  const {
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
  } = useWebRTC(roomId);

  const [showCallButtons, setShowCallButtons] = useState(true);

  // Notify parent of call state changes
  useEffect(() => {
    onCallStateChange?.({
      callStarted,
      incomingCall,
      callType,
      incomingCallType,
    });
  }, [callStarted, incomingCall, callType, incomingCallType, onCallStateChange]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startVoiceCall: () => {
      startCall("audio");
      setShowCallButtons(false);
    },
    startVideoCall: () => {
      startCall("video");
      setShowCallButtons(false);
    },
  }));

  const handleStartVoiceCall = () => {
    startCall("audio");
    setShowCallButtons(false);
  };

  const handleStartVideoCall = () => {
    startCall("video");
    setShowCallButtons(false);
  };

  const handleEndCall = () => {
    endCall();
    setShowCallButtons(true);
  };

  return (
    <div>
      {/* 🔔 Incoming Call UI */}
      {incomingCall && !callStarted && (
        <div className="mb-4 rounded-lg border bg-yellow-100 p-4 text-center shadow-sm">
          <div className="mb-3">
            <p className="text-lg font-semibold text-gray-800">
              📞 Incoming {incomingCallType === "video" ? "Video" : "Voice"} Call
            </p>
            <p className="text-sm text-gray-600">
              {selectedUser?.name || "Someone"} is calling you...
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={acceptCall}
              className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 transition-colors"
            >
              ✅ Accept
            </button>
            <button
              onClick={rejectCall}
              className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700 transition-colors"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {/* ▶ Call Start Buttons - REMOVED - Now only in ChatWindow header */}

      {/* 🎛 In-call Controls */}
      {callStarted && (
        <div className="mb-4">
          <div className="mb-3 text-center">
            <p className="text-sm font-medium text-gray-700">
              {callType === "video" ? "📹 Video Call" : "📞 Voice Call"} in progress...
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={toggleMute}
              className={`rounded-lg px-3 py-2 font-medium text-white transition-colors ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>

            {callType === "video" && (
              <button
                onClick={toggleCamera}
                className={`rounded-lg px-3 py-2 font-medium text-white transition-colors ${
                  isCameraOff
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isCameraOff ? "📷 Camera On" : "📷 Camera Off"}
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 transition-colors"
            >
              📞 End Call
            </button>
          </div>
        </div>
      )}

      {/* 🎥 Video Area - Only show for video calls */}
      {callStarted && callType === "video" && (
        <div className="flex flex-col gap-4 sm:flex-row mb-4">
          <div className="flex-1 relative">
            <p className="mb-2 text-sm font-medium text-gray-700">You</p>
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-48 w-full rounded-lg bg-gray-900 object-cover"
                onLoadedMetadata={(e) => {
                  e.target.play().catch(err => console.error("Local video play error:", err));
                }}
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                  <span className="text-white text-lg">📷 Camera Off</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-gray-700">Remote User</p>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-48 w-full rounded-lg bg-gray-900 object-cover"
              onLoadedMetadata={(e) => {
                e.target.play().catch(err => console.error("Remote video play error:", err));
              }}
            />
          </div>
        </div>
      )}

      {/* 🎵 Voice Call Indicator */}
      {callStarted && callType === "audio" && (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">📞</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-800">Voice Call in Progress</p>
          <p className="text-sm text-gray-600">Connected</p>
        </div>
      )}
    </div>
  );
});

VideoCall.displayName = 'VideoCall';

export default VideoCall;
