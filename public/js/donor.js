// document.addEventListener("DOMContentLoaded", () => {
//   if (!window.socket) return;

//   socket.on("blood_request", (data) => {
//     console.log("DONOR RECEIVED:", data);
//     showRequestCard(data);
//   });
// });

// function showRequestCard(data) {
//   const container = document.getElementById("requests");
//   if (!container) return;

//   const card = document.createElement("div");
//   card.className = "request-card";

//   const hospitalName = data.hospital?.name ?? "Unknown";

//   card.innerHTML = `
//     <h4> Blood Group: ${data.bloodGroup}</h4>
//     <p>Units Needed: ${data.units}</p>
//     <p>Hospital: ${hospitalName}</p>
//     <button class="accept-btn">Accept</button>
//   `;

//   card.querySelector(".accept-btn").onclick = () => {
//     socket.emit("donor_accept", { requestId: data.requestId });
//     card.querySelector(".accept-btn").disabled = true;
//     card.innerHTML += "<p>✅ Accepted</p>";
//   };

//   container.appendChild(card);
// }


document.addEventListener("DOMContentLoaded", () => {
  if (!window.socket) {
    console.error(" Socket not initialized");
    return;
  }

  socket.on("blood_request", (data) => {
    console.log(" DONOR RECEIVED:", data);
    appendRequestItem(data);
  });
});

function appendRequestItem(data) {
  const ul = document.getElementById("requests");
  if (!ul) return;

  const hospitalName = data.hospital?.name ?? "Unknown";

  //  create li
  const li = document.createElement("li");
  li.className = "request-item";

  //  create card inside li
  li.innerHTML = `
    <div class="request-card">
      <h4> Blood Group: ${data.bloodGroup}</h4>
      <p>Units Needed: ${data.units}</p>
      <p>Hospital: ${hospitalName}</p>
      <button class="accept-btn">Accept</button>
    </div>
  `;

  const acceptBtn = li.querySelector(".accept-btn");

  acceptBtn.addEventListener("click", () => {
    socket.emit("donor_accept", { requestId: data.requestId });

    acceptBtn.disabled = true;
    acceptBtn.innerText = "Accepted";

    li.querySelector(".request-card").insertAdjacentHTML(
      "beforeend",
      "<p class='accepted-text'> Accepted</p>"
    );
  });

  ul.appendChild(li);
}
