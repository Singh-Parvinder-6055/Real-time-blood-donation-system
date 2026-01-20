
    const toggleBtn = document.getElementById('toggleReject');
    const cancelBtn = document.getElementById('cancelReject');
    const rejectSection = document.getElementById('rejectionSection');
    const rejectForm = document.getElementById('rejectForm');
    const reasonInput = document.getElementById('rejectionReason');
    const errorMsg = document.getElementById('error-msg');

    // Toggle and Scroll
    toggleBtn.addEventListener('click', () => {
        rejectSection.style.display = 'block';
        
        // This line handles the automatic scrolling
        rejectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        toggleBtn.classList.add('disabled'); // Visual feedback that it's open
    });

    // Cancel and Scroll back up (Optional)
    cancelBtn.addEventListener('click', () => {
        rejectSection.style.display = 'none';
        toggleBtn.classList.remove('disabled');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls back to top
    });

    // Validation
    rejectForm.addEventListener('submit', (e) => {
        if (reasonInput.value.trim() === "") {
            e.preventDefault();
            errorMsg.style.display = 'block';
            reasonInput.style.borderColor = "red";
        }
    });