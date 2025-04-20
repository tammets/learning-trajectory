document.addEventListener('DOMContentLoaded', function() {

    // --- Element References ---
    // Add Resource Modal Elements
    const addResourceModal = document.getElementById('addResourceModal');
    const closeModalHeaderBtn = document.getElementById('closeModalHeaderBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const resourceListModal = document.getElementById('resourceList'); // List inside the modal
    const addResourceBtn = document.getElementById('addResourceBtn'); // Button in modal footer
    const resourceUrlInput = document.getElementById('resourceUrlInput');
    const resourceSearchInput = document.getElementById('resourceSearchInput');

    // Edit Episode Modal Elements
    const editEpisodeModal = document.getElementById('editEpisodeModal'); // Assumes this exists in HTML
    const editEpisodeForm = document.getElementById('editEpisodeForm'); // Assumes this exists in HTML
    const editEpisodeTitleInput = document.getElementById('editEpisodeTitle'); // Assumes this exists in HTML
    const editEpisodeDescriptionInput = document.getElementById('editEpisodeDescription'); // Assumes this exists in HTML
    const editEpisodeKnowbitsSelect = document.getElementById('editEpisodeKnowbits'); // Assumes this exists in HTML
    const editEpisodeSkillbitsSelect = document.getElementById('editEpisodeSkillbits'); // Assumes this exists in HTML
    const editingEpisodeIdInput = document.getElementById('editingEpisodeId'); // Assumes this exists in HTML
    const saveEpisodeChangesBtn = document.getElementById('saveEpisodeChangesBtn'); // Assumes this exists in HTML
    const cancelEditEpisodeBtn = document.getElementById('cancelEditEpisodeBtn'); // Assumes this exists in HTML
    const closeEditEpisodeModalBtn = document.getElementById('closeEditEpisodeModalBtn'); // Assumes this exists in HTML

    // Trajectory Page Elements
    const episodesContainer = document.getElementById('episodesContainer');
    const addNewEpisodeBtn = document.getElementById('addNewEpisodeBtn');

    // --- State ---
    // Modal State
    let selectedResourceId = null;
    let resourceUrlValue = '';
    let currentTargetActivityElement = null; // Stores which activity triggered the Add Resource modal

    // Counters for unique IDs
    let episodeCounter = (episodesContainer?.querySelectorAll('.episode-card').length || 0) + 1;
    let activityCounter = (episodesContainer?.querySelectorAll('.activity-item').length || 0) + 1;

    // --- Utility Functions (Add Resource Modal) ---
    function isValidUrl(string) {
        return string && string.trim().length > 5 && string.includes('://');
    }

    function updateAddButtonState() {
        if (!addResourceBtn) return;
        const isListSelected = selectedResourceId !== null;
        const isUrlEntered = isValidUrl(resourceUrlInput?.value || ''); // Add null check
        addResourceBtn.disabled = !(isListSelected || isUrlEntered);
    }

    // --- Filtering Function (Add Resource Modal) ---
    function filterResourceList() {
        if (!resourceSearchInput || !resourceListModal) return;
        const searchTerm = resourceSearchInput.value.toLowerCase().trim();
        const listItems = resourceListModal.querySelectorAll('.resource-item');
        listItems.forEach(item => {
            const titleElement = item.querySelector('.min-w-0 p');
            const title = titleElement ? titleElement.textContent.toLowerCase() : '';
            item.classList.toggle('hidden', !(title.includes(searchTerm) || searchTerm === ''));
        });
    }

    // --- Add Resource Modal Visibility ---
    function openModal(triggeringActivityElement) {
        if (!addResourceModal) return;
        currentTargetActivityElement = triggeringActivityElement;
        console.log("Opening Add Resource modal for activity:", currentTargetActivityElement?.dataset.activityId);
        resetModalInputsAndSelection();
        addResourceModal.classList.remove('hidden');
        if (resourceSearchInput) resourceSearchInput.focus();
        else if (cancelModalBtn) cancelModalBtn.focus();
    }

    function closeModal() {
        if (!addResourceModal) return;
        addResourceModal.classList.add('hidden');
        resetModalInputsAndSelection();
        currentTargetActivityElement = null;
    }

    // --- Add Resource Modal Input Handling ---
    function resetModalInputsAndSelection() {
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
        if (resourceUrlInput) resourceUrlInput.value = '';
        resourceUrlValue = '';
        if (resourceSearchInput) resourceSearchInput.value = '';
        filterResourceList();
        updateAddButtonState();
    }

    function handleResourceSelection(listItem) {
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
        if (!resourceUrlInput) return; // Added null check
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

    // --- Function to add the selected resource to the correct activity's list ---
    function addResourceToActivityList(title) {
        if (!currentTargetActivityElement) {
            console.error("Cannot add resource: Target activity element not set.");
            return;
        }
        let resourceListElement = currentTargetActivityElement.querySelector('.mt-2 ul.list-disc'); // More specific selector
        if (!resourceListElement) {
             console.warn("Could not find the resource list UL within the target activity:", currentTargetActivityElement.dataset.activityId, ". Creating it.");
             const resourceDiv = currentTargetActivityElement.querySelector('.mt-2'); // Find the div containing resources area
             const addButton = resourceDiv ? resourceDiv.querySelector('.openModalBtn') : null; // Find the add button
             if(resourceDiv && addButton) {
                 const newUl = document.createElement('ul');
                 newUl.className = 'list-disc pl-5 mt-1';
                 resourceDiv.insertBefore(newUl, addButton); // Insert the new UL before the button
                 resourceListElement = newUl;
             } else {
                 console.error("Could not find appropriate place to insert resource list UL in activity:", currentTargetActivityElement.dataset.activityId)
                 return; // Can't find where to put the list
             }
        }
        const newLi = document.createElement('li');
        newLi.textContent = title;
        resourceListElement.appendChild(newLi);
        console.log(`Added resource "${title}" to activity ${currentTargetActivityElement.dataset.activityId}`);
    }

    // --- Edit Episode Modal Visibility & Handling ---
    function openEditEpisodeModal(episodeCardElement) {
      // console.log("Inside openEditEpisodeModal function."); // Kept for debugging if needed
      // console.log("editEpisodeModal variable:", editEpisodeModal); // Kept for debugging if needed
        if (!editEpisodeModal || !episodeCardElement) {
             console.error("Edit modal (#editEpisodeModal) or episode card element not found!");
             return;
        }
        const episodeId = episodeCardElement.dataset.episodeId;
        const currentTitleElement = episodeCardElement.querySelector('h3');
        const currentDescriptionElement = episodeCardElement.querySelector('p.text-gray-600');
        const currentTitle = currentTitleElement ? currentTitleElement.textContent.trim() : '';
        const currentDescription = currentDescriptionElement ? currentDescriptionElement.textContent.trim() : '';
        // TODO: Retrieve saved knowbits/skillbits based on episodeId and set selected options
        // const savedKnowbits = episodeCardElement.dataset.knowbits ? JSON.parse(episodeCardElement.dataset.knowbits) : [];
        // const savedSkillbits = episodeCardElement.dataset.skillbits ? JSON.parse(episodeCardElement.dataset.skillbits) : []; // TODO: uncomment when needed

        editingEpisodeIdInput.value = episodeId;
        editEpisodeTitleInput.value = currentTitle; 
        editEpisodeDescriptionInput.value = currentDescription;

        // Clear previous selections and select saved ones (example)
        if(editEpisodeKnowbitsSelect) { // Add null check
            Array.from(editEpisodeKnowbitsSelect.options).forEach(option => {
                // option.selected = savedKnowbits.includes(option.value);
                 option.selected = false; // Resetting for now
            }); 
        }
         if(editEpisodeSkillbitsSelect) { // Add null check
            Array.from(editEpisodeSkillbitsSelect.options).forEach(option => {
                // option.selected = savedSkillbits.includes(option.value);
                option.selected = false; // Resetting for now
            });
         } 


        editEpisodeModal.classList.remove('hidden');
        // console.log("Attempted to remove 'hidden' class from edit modal."); // Kept for debugging if needed
        if(editEpisodeTitleInput) editEpisodeTitleInput.focus(); // Add null check
    }

    function closeEditEpisodeModal() {
        if (!editEpisodeModal) return;
        editEpisodeModal.classList.add('hidden');
        if (editEpisodeForm) editEpisodeForm.reset();
        if(editingEpisodeIdInput) editingEpisodeIdInput.value = ''; // Add null check
    }

    function handleSaveEpisodeChanges(event) {
        event.preventDefault();
        if (!editEpisodeForm || !episodesContainer || !editingEpisodeIdInput || !editEpisodeTitleInput || !editEpisodeDescriptionInput || !editEpisodeKnowbitsSelect || !editEpisodeSkillbitsSelect) { // Added null checks
             console.error("One or more elements needed for saving episode changes not found.");
             return;
        }
        const episodeId = editingEpisodeIdInput.value;
        const episodeCard = episodesContainer.querySelector(`.episode-card[data-episode-id="${episodeId}"]`);

        if (!episodeCard) {
            console.error("Could not find episode card to update for ID:", episodeId);
            closeEditEpisodeModal();
            return;
        }

        const newTitle = editEpisodeTitleInput.value.trim();
        const newDescription = editEpisodeDescriptionInput.value.trim();
        const selectedKnowbits = Array.from(editEpisodeKnowbitsSelect.selectedOptions).map(option => option.value);
        const selectedSkillbits = Array.from(editEpisodeSkillbitsSelect.selectedOptions).map(option => option.value);

        console.log(`Saving changes for Episode ${episodeId}: Title: ${newTitle}, Desc: ${newDescription}, KB: ${selectedKnowbits}, SB: ${selectedSkillbits}`);

        // Update the Episode Card Display
        const titleElement = episodeCard.querySelector('h3');
        const descriptionElement = episodeCard.querySelector('p.text-gray-600');

        if (titleElement) titleElement.textContent = newTitle || `Episode ${episodeId.split('-')[1]}`;
        if (descriptionElement) descriptionElement.textContent = newDescription;

        // Update Knowbits/Skillbits display
        const knowbitsDisplay = episodeCard.querySelector('.knowbits-display');
        const skillbitsDisplay = episodeCard.querySelector('.skillbits-display');

        if (knowbitsDisplay) {
            knowbitsDisplay.textContent = selectedKnowbits.length > 0 ? `Knowbits: ${selectedKnowbits.join(', ')}` : '';
        } else {
            console.warn("Knowbits display element not found for episode:", episodeId);
        }

        if (skillbitsDisplay) {
            skillbitsDisplay.textContent = selectedSkillbits.length > 0 ? `Skillbits: ${selectedSkillbits.join(', ')}` : '';
        } else {
            console.warn("Skillbits display element not found for episode:", episodeId);
        }
        
        closeEditEpisodeModal();
    }

    // --- Trajectory Structure Creation Functions ---
    function createActivityElement(newActivityId, episodeId) {
        const activityLi = document.createElement('li');
        activityLi.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-md activity-item border border-gray-100';
        activityLi.dataset.activityId = newActivityId;
        activityLi.dataset.parentEpisodeId = episodeId;

        activityLi.innerHTML = `
            <div class="flex-grow pr-4">
                <p class="text-sm font-medium text-gray-800">New Learning Activity</p>
                <p class="text-xs text-gray-500">Type: Individual | Location: School | Time: ? | Difficulty: ?</p>
                <div class="mt-2 text-xs">
                    <span class="font-medium">Resources:</span>
                    <ul class="list-disc pl-5 mt-1"></ul>
                    <button type="button" class="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 openModalBtn">
                       <span aria-hidden="true">+</span> Add Resource
                    </button>
                </div>
            </div>
            <div class="flex-shrink-0">
                <button type="button" class="text-xs font-medium text-indigo-600 hover:text-indigo-500 mr-2 edit-activity-btn">Edit</button>
                <button type="button" class="text-xs font-medium text-red-600 hover:text-red-500 remove-activity-btn">Remove</button>
            </div>
        `;
        return activityLi;
    }

    function createEpisodeElement(newEpisodeId) {
        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl p-6 episode-card border border-gray-200';
        episodeDiv.dataset.episodeId = newEpisodeId;
        // Initialize data attributes for knowbits/skillbits
        episodeDiv.dataset.knowbits = '[]';
        episodeDiv.dataset.skillbits = '[]';
        
        episodeDiv.innerHTML = `
            <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-indigo-700">New Episode ${newEpisodeId.split('-')[1]}</h3>
                <p class="mt-1 text-sm text-gray-600">Enter episode description...</p>
                <div class="mt-2 space-y-1">
                    <div class="knowbits-display text-xs text-gray-500 italic"></div>
                    <div class="skillbits-display text-xs text-gray-500 italic"></div>
                </div>
                </div>
            <div class="flex-shrink-0 ml-4">
                <button type="button" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 mr-3 edit-episode-btn">Edit</button>
                <button type="button" class="text-sm font-medium text-red-600 hover:text-red-500 remove-episode-btn">Remove Episode</button>
            </div>
            </div>
        <div class="mt-6 border-t border-gray-200 pt-6">
            <h4 class="text-base font-semibold text-gray-800 mb-4">Learning Activities</h4>
            <ul class="space-y-4 learning-activities-list"></ul>
             <button type="button" class="mt-4 inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 add-activity-btn">
                <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                Add Learning Activity
            </button>
        </div>
    `;
        return episodeDiv;
    }

    // --- Event Handlers for Trajectory Structure ---
    function handleAddEpisode() {
        const newEpisodeId = `episode-${episodeCounter++}`;
        const newEpisodeElement = createEpisodeElement(newEpisodeId);
        if (episodesContainer) episodesContainer.appendChild(newEpisodeElement);
        else console.error("Episodes container not found!");
    }

    function handleAddActivity(buttonElement) {
        const parentEpisodeCard = buttonElement.closest('.episode-card');
        const activityList = parentEpisodeCard?.querySelector('.learning-activities-list');
        const episodeId = parentEpisodeCard?.dataset.episodeId || 'unknown';
        if (activityList) {
            const newActivityId = `activity-${activityCounter++}`;
            const newActivityElement = createActivityElement(newActivityId, episodeId);
            activityList.appendChild(newActivityElement);
        } else console.error("Could not find activity list for episode:", episodeId);
    }

    function handleRemoveEpisode(buttonElement) {
        const episodeCard = buttonElement.closest('.episode-card');
        if (episodeCard) episodeCard.remove();
    }

    function handleRemoveActivity(buttonElement) {
        const activityItem = buttonElement.closest('.activity-item');
        if (activityItem) activityItem.remove();
    }

    function handleEditEpisode(buttonElement) {
      console.log("Edit button clicked!"); // Kept for debugging
        const episodeCard = buttonElement.closest('.episode-card');
        console.log("Found episode card element:", episodeCard); // Kept for debugging
        if (episodeCard) {
          console.log("Calling openEditEpisodeModal for:", episodeCard.dataset.episodeId); // Kept for debugging
          openEditEpisodeModal(episodeCard);
      }else console.error("Could not find parent episode card for edit button.");
    }

    function handleEditActivity(buttonElement) {
        const activityItem = buttonElement.closest('.activity-item');
        const activityId = activityItem?.dataset.activityId || 'unknown';
        console.log("--- Edit Activity Clicked --- ID:", activityId);
        alert(`Editing Activity: ${activityId} (Not implemented yet)`);
    }

    // --- Main Event Listeners Setup ---
    if (addNewEpisodeBtn) addNewEpisodeBtn.addEventListener('click', handleAddEpisode);
    else console.warn("Button #addNewEpisodeBtn not found.");

    if (episodesContainer) {
        episodesContainer.addEventListener('click', function(event) {
            const target = event.target;
            // Use closest to handle clicks on icons inside buttons too
            const addActivityBtn = target.closest('.add-activity-btn');
            const removeEpisodeBtn = target.closest('.remove-episode-btn');
            const removeActivityBtn = target.closest('.remove-activity-btn');
            const editEpisodeBtn = target.closest('.edit-episode-btn');
            const editActivityBtn = target.closest('.edit-activity-btn');
            const openModalBtn = target.closest('.openModalBtn'); // Add Resource button in activity

            if (addActivityBtn) handleAddActivity(addActivityBtn);
            else if (removeEpisodeBtn) handleRemoveEpisode(removeEpisodeBtn);
            else if (removeActivityBtn) handleRemoveActivity(removeActivityBtn);
            else if (editEpisodeBtn) handleEditEpisode(editEpisodeBtn);
            else if (editActivityBtn) handleEditActivity(editActivityBtn);
            else if (openModalBtn) {
                 const activityElement = target.closest('.activity-item');
                 if(activityElement) openModal(activityElement);
                 else console.error("Could not find parent activity for 'Add Resource' button.");
            }
        });
    }

    // --- Add Resource Modal Listeners ---
    if (closeModalHeaderBtn) closeModalHeaderBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (addResourceModal) addResourceModal.addEventListener('click', (event) => { if (event.target === addResourceModal) closeModal(); });
    if (resourceListModal) {
        resourceListModal.addEventListener('click', (event) => handleResourceSelection(event.target.closest('.resource-item')));
        // Basic keydown listener (add more features like arrow keys if needed)
        resourceListModal.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                 if (document.activeElement && document.activeElement.matches('.resource-item')) {
                    event.preventDefault();
                     handleResourceSelection(document.activeElement);
                 }
            }
         });
    }
    if (resourceUrlInput) resourceUrlInput.addEventListener('input', handleUrlInputChange);
    if (resourceSearchInput) resourceSearchInput.addEventListener('input', filterResourceList);
    // Listener for the 'ADD RESOURCE' button IN MODAL (Corrected)
    if (addResourceBtn) {
        addResourceBtn.addEventListener('click', () => {
            let resourceTitle = 'Unknown Resource';
            if (selectedResourceId !== null) {
                const selectedLiElement = resourceListModal.querySelector(`.resource-item[data-resource-id="${selectedResourceId}"]`);
                if (selectedLiElement) {
                    const titleElement = selectedLiElement.querySelector('.min-w-0 p');
                    resourceTitle = titleElement ? titleElement.textContent.trim() : resourceTitle;
                    addResourceToActivityList(resourceTitle); // Correct function
                    closeModal();
                } else { closeModal(); }
            } else if (isValidUrl(resourceUrlInput?.value || '')) { // Added null check
                resourceTitle = resourceUrlInput.value.trim();
                addResourceToActivityList(resourceTitle); // Correct function
                closeModal();
            } else { console.warn("Add resource button clicked, but no valid selection or URL found."); }
        });
    }

    // --- Edit Episode Modal Listeners ---
    if (editEpisodeForm) editEpisodeForm.addEventListener('submit', handleSaveEpisodeChanges);
    if (cancelEditEpisodeBtn) cancelEditEpisodeBtn.addEventListener('click', closeEditEpisodeModal);
    if (closeEditEpisodeModalBtn) closeEditEpisodeModalBtn.addEventListener('click', closeEditEpisodeModal);
    if (editEpisodeModal) editEpisodeModal.addEventListener('click', (event) => { if (event.target === editEpisodeModal) closeEditEpisodeModal(); });

    // --- Initial Setup ---
    resetModalInputsAndSelection(); // Reset add resource modal state

}); // End of DOMContentLoaded