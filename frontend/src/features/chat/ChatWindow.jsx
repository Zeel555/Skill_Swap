import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { addMessage, getChat, sendMessage } from "./chatSlice";
import VideoCall from "./VideoCall";
import { getUserById } from "../users/userSlice";



const ChatWindow = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { chats, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.user);
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const videoCallRef = useRef(null);
  const [callState, setCallState] = useState({
    callStarted: false,
    incomingCall: false,
    callType: null,
    incomingCallType: null,
  });

  const messages = chats[userId] || [];
  
  // ✅ Create deterministic roomId for calls
  const callRoomId =
  user && userId
    ? [user._id, userId].sort().join("_")
    : null;

  useEffect(() => {
    if (userId) {
      dispatch(getChat(userId));
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (socket && userId) {
      const handleReceiveMessage = (data) => {
        console.log("📨 Received message via socket:", data);
        // Check if message is for this chat
        if (data.sender === userId || (data.sender === user._id && data.receiver === userId)) {
          // Format message to match expected structure
          const formattedMessage = {
            _id: data._id || Date.now().toString(),
            sender: data.sender || data.senderId,
            receiver: data.receiver || data.receiverId || userId,
            message: data.message || data.text,
            createdAt: data.createdAt || new Date().toISOString(),
          };
          dispatch(addMessage({ userId, message: formattedMessage }));
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, userId, dispatch, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const result = await dispatch(
      sendMessage({ receiverId: userId, message })
    );

    if (sendMessage.fulfilled.match(result)) {
      setMessage("");
      // Add message to local state immediately for instant feedback
      dispatch(addMessage({ userId, message: result.payload }));
      
      // Also emit via socket for real-time delivery
      if (socket && socket.connected) {
        socket.emit("sendMessage", {
          receiverId: userId,
          message: result.payload.message
        });
        console.log("📤 Message sent via socket to:", userId);
      }
    }
  };

  if (loading && messages.length === 0) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-lg border bg-white shadow">
      {/* ✅ CHAT HEADER WITH USER NAME AND CALL BUTTONS */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {selectedUser?.name || "Loading..."}
            </h2>
          </div>
        </div>

        {/* Call Buttons - Only show when no call is active */}
        {!callState.callStarted && !callState.incomingCall && callRoomId && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (videoCallRef.current) {
                  videoCallRef.current.startVoiceCall();
                } else {
                  console.error("VideoCall component not ready");
                  alert("Please wait, call system is initializing...");
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!callRoomId}
            >
              <span>📞</span> Voice
            </button>
            <button
              onClick={() => {
                if (videoCallRef.current) {
                  videoCallRef.current.startVideoCall();
                } else {
                  console.error("VideoCall component not ready");
                  alert("Please wait, call system is initializing...");
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!callRoomId}
            >
              <span>📹</span> Video
            </button>
          </div>
        )}
      </div>

      {/* ✅ VIDEO / VOICE CALL CONTROLS */}
      <div>
        {callRoomId ? (
          <VideoCall
            ref={videoCallRef}
            roomId={callRoomId}
            onCallStateChange={setCallState}
            selectedUser={selectedUser}
          />
        ) : (
          <div className="px-4 py-2 text-xs text-gray-500">
            ⚠️ Call room not ready. Socket: {socket ? (socket.connected ? "✅ Connected" : "❌ Disconnected") : "❌ Not initialized"}
          </div>
        )}
      </div>


      {/* ✅ CHAT MESSAGES */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender === user._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  isOwn
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.message}</p>
                <p
                  className={`mt-1 text-xs ${
                    isOwn ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

        {/* ✅ MESSAGE INPUT */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

