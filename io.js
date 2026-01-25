let io;

module.exports.init = (serverIO) => {
  io = serverIO;
};

module.exports.getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

