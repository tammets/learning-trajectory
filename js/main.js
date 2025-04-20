document.addEventListener('DOMContentLoaded', function() {

  // --- Element References ---
  const addResourceModal = document.getElementById('addResourceModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalHeaderBtn = document.getElementById('closeModalHeaderBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const resourceListModal = document.getElementById('resourceList'); // List inside the modal
  const addResourceBtn = document.getElementById('addResourceBtn');
  const resourceUrlInput = document.getElementById('resourceUrlInput');
  const existingResourceList = document.getElementById('existingResourceList'); // Your main list
  const resourceSearchInput = document.getElementById('resourceSearchInput'); // <<< NEW Search Input

  // --- State ---
  let selectedResourceId = null;
  let resourceUrlValue = '';

  // --- Utility Functions ---
  function isValidUrl(string) {
      return string && string.trim().length > 5 && string.includes('://');
  }

  function updateAddButtonState() {
      if (!addResourceBtn) return;
      const isListSelected = selectedResourceId !== null;
      const isUrlEntered = isValidUrl(resourceUrlInput.value);
      addResourceBtn.disabled = !(isListSelected || isUrlEntered);
  }

  // --- Filtering Function ---
  function filterResourceList() {
      if (!resourceSearchInput || !resourceListModal) return;

      const searchTerm = resourceSearchInput.value.toLowerCase().trim();
      const listItems = resourceListModal.querySelectorAll('.resource-item');
      let visibleCount = 0;

      listItems.forEach(item => {
          const titleElement = item.querySelector('.min-w-0 p'); // Find the title paragraph
          const title = titleElement ? titleElement.textContent.toLowerCase() : '';

          // Check if title includes the search term (or if search is empty)
          if (title.includes(searchTerm) || searchTerm === '') {
              item.classList.remove('hidden'); // Show item
              visibleCount++;
          } else {
              item.classList.add('hidden'); // Hide item
          }
      });

      // Optional: Handle 'No results' message
      // const noResultsMsg = document.getElementById('noResultsMessage');
      // if (noResultsMsg) {
      //    noResultsMsg.classList.toggle('hidden', visibleCount > 0);
      // }
  }


  // --- Modal Visibility Functions ---
  function openModal() {
      if (!addResourceModal) return;
      resetInputsAndSelection(); // Resets search too
      addResourceModal.classList.remove('hidden');
      // Focus management - focus search input first if it exists
      if (resourceSearchInput) {
          resourceSearchInput.focus();
      } else {
          const firstListItem = resourceListModal ? resourceListModal.querySelector('.resource-item:not(.hidden)') : null; // Focus first visible item
           if (firstListItem) {
               firstListItem.focus();
           } else if (resourceUrlInput) {
              resourceUrlInput.focus();
           } else if (cancelModalBtn) {
              cancelModalBtn.focus();
           }
      }
  }

  function closeModal() {
      if (!addResourceModal) return;
      addResourceModal.classList.add('hidden');
      resetInputsAndSelection();
  }

  // --- Resource Selection & Input Handling ---
  function resetInputsAndSelection() {
      // Clear list selection
      if (resourceListModal) {
          const currentlySelected = resourceListModal.querySelector('.resource-item[aria-selected="true"]');
          if (currentlySelected) {
              currentlySelected.classList.remove('bg-indigo-50');
              const indicator = currentlySelected.querySelector('.selection-indicator');
              if (indicator) indicator.classList.add('hidden');
              currentlySelected.setAttribute('aria-selected', 'false');
          }
      }
      selectedResourceId = null;

      // Clear URL input
      if (resourceUrlInput) {
          resourceUrlInput.value = '';
      }
      resourceUrlValue = '';

      // Clear Search input and reset filter <<< NEW
      if (resourceSearchInput) {
          resourceSearchInput.value = '';
      }
      filterResourceList(); // Run filter with empty search term to show all items

      // Update button state
      updateAddButtonState();
  }

  function handleResourceSelection(listItem) {
       // Only allow selection if the item is not hidden by the filter
       if (!listItem || !listItem.classList.contains('resource-item') || listItem.classList.contains('hidden')) return;

       const resourceId = listItem.dataset.resourceId;
       if (selectedResourceId !== resourceId && resourceUrlInput) {
           resourceUrlInput.value = '';
           resourceUrlValue = '';
       }
       const previouslySelected = resourceListModal.querySelector('.resource-item[aria-selected="true"]');
       if (previouslySelected && previouslySelected !== listItem) {
          previouslySelected.classList.remove('bg-indigo-50');
          const prevIndicator = previouslySelected.querySelector('.selection-indicator');
          if (prevIndicator) prevIndicator.classList.add('hidden');
          previouslySelected.setAttribute('aria-selected', 'false');
       }
       listItem.classList.add('bg-indigo-50');
       const indicator = listItem.querySelector('.selection-indicator');
       if (indicator) indicator.classList.remove('hidden');
       listItem.setAttribute('aria-selected', 'true');
       selectedResourceId = resourceId;
       updateAddButtonState();
  }

  function handleUrlInputChange() {
      resourceUrlValue = resourceUrlInput.value.trim();
      if (resourceUrlValue.length > 0 && selectedResourceId !== null) {
           const previouslySelected = resourceListModal.querySelector('.resource-item[aria-selected="true"]');
           if (previouslySelected) {
               previouslySelected.classList.remove('bg-indigo-50');
               const prevIndicator = previouslySelected.querySelector('.selection-indicator');
               if (prevIndicator) prevIndicator.classList.add('hidden');
               previouslySelected.setAttribute('aria-selected', 'false');
           }
           selectedResourceId = null;
      }
      updateAddButtonState();
  }

  // Function to add item to the existing list (as before)
  function addResourceToExistingList(title, identifier) {
      if (!existingResourceList) {
          console.error("Target list #existingResourceList not found on the page.");
          return;
      }
      const newLi = document.createElement('li');
      newLi.className = 'flex justify-between gap-x-6 py-6 added-resource';
      newLi.dataset.resourceIdentifier = identifier;
      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-medium text-gray-900';
      titleSpan.textContent = title;
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'font-semibold text-red-600 hover:text-red-500';
      removeButton.textContent = 'Remove';
      removeButton.onclick = function() { this.closest('li').remove(); };
      newLi.appendChild(titleSpan);
      newLi.appendChild(removeButton);
      existingResourceList.appendChild(newLi);
  }


  // --- Event Listeners ---

  if (openModalBtn) {
      openModalBtn.addEventListener('click', (event) => {
          event.preventDefault();
          openModal();
      });
  } else {
      console.warn('Element with ID "openModalBtn" was not found.');
  }

  if (closeModalHeaderBtn) closeModalHeaderBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  if (addResourceModal) {
      addResourceModal.addEventListener('click', (event) => {
          if (event.target === addResourceModal) closeModal();
      });
  }

  // Listener for resource list clicks (modal)
  if (resourceListModal) {
      resourceListModal.addEventListener('click', (event) => {
          const listItem = event.target.closest('.resource-item');
          handleResourceSelection(listItem);
      });
      // Keyboard nav needs update to respect hidden items potentially
      resourceListModal.addEventListener('keydown', (event) => {
           const currentItem = document.activeElement;
           // Ensure focus is on a *visible* list item
           if (!currentItem || !currentItem.matches('.resource-item:not(.hidden)') || !resourceListModal.contains(currentItem)) return;
           let targetItem = null;

           if (event.key === 'Enter' || event.key === ' ') {
               event.preventDefault(); handleResourceSelection(currentItem);
           } else if (event.key === 'ArrowDown') {
               event.preventDefault();
               targetItem = currentItem.nextElementSibling;
               // Skip hidden items when navigating down
               while(targetItem && (!targetItem.matches('.resource-item') || targetItem.classList.contains('hidden'))) {
                   targetItem = targetItem.nextElementSibling;
               }
           } else if (event.key === 'ArrowUp') {
               event.preventDefault();
               targetItem = currentItem.previousElementSibling;
               // Skip hidden items when navigating up
               while(targetItem && (!targetItem.matches('.resource-item') || targetItem.classList.contains('hidden'))) {
                  targetItem = targetItem.previousElementSibling;
               }
           }
           if (targetItem) targetItem.focus();
      });
  }

  // Listener for URL input (as before)
  if (resourceUrlInput) {
      resourceUrlInput.addEventListener('input', handleUrlInputChange);
  }

  // <<< NEW: Listener for the search input >>>
  if (resourceSearchInput) {
      resourceSearchInput.addEventListener('input', filterResourceList);
  }

  // Listener for the 'ADD RESOURCE' button (as before)
  if (addResourceBtn) {
      addResourceBtn.addEventListener('click', () => {
          if (selectedResourceId !== null) {
              const selectedLiElement = resourceListModal.querySelector(`.resource-item[data-resource-id="${selectedResourceId}"]`);
              if (selectedLiElement) {
                  const titleElement = selectedLiElement.querySelector('.min-w-0 p');
                  const resourceTitle = titleElement ? titleElement.textContent.trim() : 'Unknown Title';
                  addResourceToExistingList(resourceTitle, selectedResourceId);
                  console.log("Adding selected resource to existing list:", resourceTitle);
                  closeModal();
              } else {
                  console.error("Could not find the selected list item element for ID:", selectedResourceId);
                  closeModal();
              }
          } else if (isValidUrl(resourceUrlInput.value)) {
              const urlToAdd = resourceUrlInput.value.trim();
              addResourceToExistingList(urlToAdd, urlToAdd);
              console.log("Adding resource from URL to existing list:", urlToAdd);
              closeModal();
          } else {
              console.warn("Add button clicked, but no valid selection or URL found.");
          }
      });
  }

  // --- Initial Setup ---
  resetInputsAndSelection();

}); // End of DOMContentLoaded