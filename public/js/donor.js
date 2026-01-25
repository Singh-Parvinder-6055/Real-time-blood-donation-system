// document.addEventListener("DOMContentLoaded", () => {
//   if (!window.socket) {
//     console.error(" Socket not initialized");
//     return;
//   }

//   socket.on("blood_request", (data) => {
//     console.log(" DONOR RECEIVED:", data);
//     appendRequestItem(data);
//   });
// });

// function appendRequestItem(data) {
//   const ul = document.getElementById("requests");
//   if (!ul) return;

//   const hospitalName = data.hospital?.name ?? "Unknown";

//   //  create li
//   const li = document.createElement("li");
//   li.className = "request-item";

//   //  create card inside li
//   li.innerHTML = `
//     <div class="request-card">
//       <h4> Blood Group: ${data.bloodGroup}</h4>
//       <p>Units Needed: ${data.units}</p>
//       <p>Hospital: ${hospitalName}</p>
//       <button class="accept-btn">Accept</button>
//     </div>
//   `;

//   const acceptBtn = li.querySelector(".accept-btn");

//   acceptBtn.addEventListener("click", () => {
//     socket.emit("donor_accept", { requestId: data.requestId });

//     acceptBtn.disabled = true;
//     acceptBtn.innerText = "Accepted";

//     li.querySelector(".request-card").insertAdjacentHTML(
//       "beforeend",
//       "<p class='accepted-text'> Accepted</p>"
//     );
//   });

//   ul.appendChild(li);
// }



document.addEventListener("DOMContentLoaded", () => {
  if (!window.socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.off("blood_request"); // prevent duplicates

  socket.on("blood_request", (data) => {
    const div = document.getElementById("blood_req_alert");
    if (!div) return;

    div.classList.remove("d-none");

    const p = document.createElement("p");
    p.innerHTML = `
      <strong>Blood Group:</strong> ${data.bloodGroup} |
      <strong>Units:</strong> ${data.units} |
      <strong>Hospital:</strong> ${data.hospital.name} (${data.hospital.city})
    `;

    div.appendChild(p);
  });
});





// if (!window.socket) {
//   console.warn("Socket not initialized");
// }

// socket.on("blood_request", (data) => {
//   console.log("New emergency:", data);

//   const ul = document.getElementById("requests");
//   if (!ul) return;

//   const li = document.createElement("li");
//   li.innerHTML = `
//     <strong>Blood Group:</strong> ${data.bloodGroup} |
//     <strong>Units:</strong> ${data.units} |
//     <strong>Hospital:</strong> ${data.hospital.name} (${data.hospital.city})
//   `;
//   ul.appendChild(li);
// });
