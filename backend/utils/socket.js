let io = null;

/**
 * Initialize socket.io ONCE from server.js
 * @param {Server} serverIo - socket.io instance
 */
const initSocket = (serverIo) => {
  if (!io) {
    io = serverIo;
    console.log("✅ Socket.io initialized globally");
  }
};

/**
 * Safe getter for socket.io
 * NEVER crashes the server
 */
const getIO = () => {
  if (!io) {
    console.warn("⚠️ Socket.io not initialized yet");
    return null;
  }
  return io;
};

module.exports = { initSocket, getIO };
