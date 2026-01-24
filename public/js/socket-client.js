(function () {
  if (window.socket) return; // 🔒 prevent multiple sockets

  window.socket = io("/", {
    auth: {
      token: document.cookie
        .split("; ")
        .find(r => r.startsWith("token="))
        ?.split("=")[1]
    }
  });

  socket.on("connect", () => {
    console.log(" Socket connected:", socket.id);
  });
})();
