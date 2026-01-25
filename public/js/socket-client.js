// (function () {
//   if (window.socket) return; //  prevent multiple sockets

//   window.socket = io("/", {
//     auth: {
//       token: document.cookie
//         .split("; ")
//         .find(r => r.startsWith("token="))
//         ?.split("=")[1]
//     }
//   });

//   socket.on("connect", () => {
//     console.log(" Socket connected:", socket.id);
//   });
// })();



// /public/js/socket-client.js
(function () {
  if (window.__socketInitialized) return; // 🔒 hard lock

  window.__socketInitialized = true;

  const token = document.cookie
    .split("; ")
    .find(r => r.startsWith("token="))
    ?.split("=")[1];

  if (!token) return;

  window.socket = io("/", {
    auth: { token },
    transports: ["websocket"] //  prevents long-poll duplication
  });

  socket.on("connect", () => {
    console.log(" Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected");
  });
})();
