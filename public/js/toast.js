// if (!window.socket) {
//   console.error("Socket missing in toast script");
// } else {
//   socket.on("blood_request", (data) => {
//     console.log(" Emergency received", data);

//     const container = document.getElementById("toastContainer");
//     if (!container) return;

//     const toastEl = document.createElement("div");
//     toastEl.className = "toast text-bg-danger border-0";
//     toastEl.setAttribute("role", "alert");

//     toastEl.innerHTML = `
//       <div class="d-flex">
//         <div class="toast-body">
//           <strong>Emergency Blood Needed</strong><br>
//           Blood Group: <b>${data.bloodGroup}</b><br>
//           Units: <b>${data.units}</b><br>
//           Hospital: ${data.hospital.name}, ${data.hospital.city}
//         </div>
//         <button type="button" class="btn-close btn-close-white me-2 m-auto"
//           data-bs-dismiss="toast"></button>
//       </div>
//     `;

//     container.appendChild(toastEl);

//     const toast = new bootstrap.Toast(toastEl, {
//       delay: 6000
//     });

//     toast.show();
//   });
// }



socket.on("blood_request", (data) => {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toastEl = document.createElement("div");
  toastEl.className = "toast text-bg-danger border-0";
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        🩸 <strong>Emergency Blood Needed</strong><br>
        Blood Group: <b>${data.bloodGroup}</b><br>
        Units: <b>${data.units}</b><br>
        Hospital: ${data.hospital.name}, ${data.hospital.city}<br>
        If you are intersted in donating blood,Please contact us at
      </div>
      <button type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close">
      </button>
    </div>
  `;

  container.appendChild(toastEl);

  //  autohide disabled
  const toast = new bootstrap.Toast(toastEl, {
    autohide: false
  });

  toast.show();
});
