const jwt = require("jsonwebtoken");

module.exports = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user; //  attach user
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    //  AUTO JOIN ROOMS
    if (socket.user.role === "donor") {
      socket.join("donors");
    }

    if (socket.user.role === "organization") {
      socket.join("organizations");
    }

    console.log("Joined rooms:", socket.rooms);
  });
};
