document.addEventListener('DOMContentLoaded', function() {
    // Now that we're embedding the modal in the same file,
    // just attach event listeners for open/close:
  
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modal = document.getElementById('addResourceModal');
  
    openModalBtn.addEventListener('click', function(event) {
      event.preventDefault();
      modal.classList.remove('hidden');
    });
  
    closeModalBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
    });
  });