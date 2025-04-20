document.addEventListener('DOMContentLoaded', function() {

    // --- Element References ---
    // Add Resource Modal Elements
    const addResourceModal = document.getElementById('addResourceModal');
    const closeModalHeaderBtn = document.getElementById('closeModalHeaderBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const resourceListModalEl = document.getElementById('resourceList'); // Renamed to avoid conflict
    const addResourceBtnModal = document.getElementById('addResourceBtn'); // Renamed to avoid conflict
    const resourceUrlInput = document.getElementById('resourceUrlInput');
    const resourceSearchInput = document.getElementById('resourceSearchInput');

    // Edit Episode Modal Elements
    const editEpisodeModal = document.getElementById('editEpisodeModal');
    const editEpisodeForm = document.getElementById('editEpisodeForm');
    const editEpisodeTitleInput = document.getElementById('editEpisodeTitle');
    const editEpisodeDescriptionInput = document.getElementById('editEpisodeDescription');
    const editEpisodeKnowbitsSelect = document.getElementById('editEpisodeKnowbits');
    const editEpisodeSkillbitsSelect = document.getElementById('editEpisodeSkillbits');
    const editingEpisodeIdInput = document.getElementById('editingEpisodeId');
    const saveEpisodeChangesBtn = document.getElementById('saveEpisodeChangesBtn');
    const cancelEditEpisodeBtn = document.getElementById('cancelEditEpisodeBtn');
    const closeEditEpisodeModalBtn = document.getElementById('closeEditEpisodeModalBtn');

    // Edit Learning Resource Modal Elements (NEW)
    const editLearningResourceModal = document.getElementById('editLearningResourceModal');
    const editLearningResourceForm = document.getElementById('editLearningResourceForm');
    const lrTitleInput = document.getElementById('lrTitleInput');
    const lrDescriptionInput = document.getElementById('lrDescriptionInput');
    const lrTypeSelect = document.getElementById('lrTypeSelect');
    const lrLocationSelect = document.getElementById('lrLocationSelect');
    const lrTimeInput = document.getElementById('lrTimeInput');
    const lrDifficultySelect = document.getElementById('lrDifficultySelect');
    const editingLearningResourceIdInput = document.getElementById('editingLearningResourceId');
    const saveLearningResourceChangesBtn = document.getElementById('saveLearningResourceChangesBtn');
    const cancelEditLearningResourceBtn = document.getElementById('cancelEditLearningResourceBtn');
    const closeEditLearningResourceModalBtn = document.getElementById('closeEditLearningResourceModalBtn');

    // Trajectory Page Elements
    const episodesContainer = document.getElementById('episodesContainer');
    const addNewEpisodeBtn = document.getElementById('addNewEpisodeBtn');

    // --- State ---
    // Add Resource Modal State
    let selectedResourceId = null;
    let resourceUrlValue = '';
    let currentTargetActivityElementForResourceAdd = null; // Stores which activity triggered the Add Resource modal

    // Counters for unique IDs
    let episodeCounter = (episodesContainer?.querySelectorAll('.episode-card').length || 0) + 1;
    let activityCounter = (episodesContainer?.querySelectorAll('.activity-item').length || 0) + 1;

    // --- Utility Functions (Add Resource Modal) ---
    function isValidUrl(string) {
        return string && string.trim().length > 5 && string.includes('://');
    }

    function updateAddButtonState() {
        if (!addResourceBtnModal) return;
        const isListSelected = selectedResourceId !== null;
        const isUrlEntered = isValidUrl(resourceUrlInput?.value || ''); // Add null check
        addResourceBtnModal.disabled = !(isListSelected || isUrlEntered);
    }

    // --- Filtering Function (Add Resource Modal) ---
    function filterResourceList() {
        if (!resourceSearchInput || !resourceListModalEl) return;
        const searchTerm = resourceSearchInput.value.toLowerCase().trim();
        const listItems = resourceListModalEl.querySelectorAll('.resource-item');
        listItems.forEach(item => {
            const titleElement = item.querySelector('.min-w-0 p');
            const title = titleElement ? titleElement.textContent.toLowerCase() : '';
            item.classList.toggle('hidden', !(title.includes(searchTerm) || searchTerm === ''));
        });
    }

    // --- Add Resource Modal Visibility ---
    function openAddResourceModal(triggeringActivityElement) {
        if (!addResourceModal) return;
        currentTargetActivityElementForResourceAdd = triggeringActivityElement;
        console.log("Opening Add Resource modal for activity:", currentTargetActivityElementForResourceAdd?.dataset.activityId);
        resetAddResourceModalInputsAndSelection();
        addResourceModal.classList.remove('hidden');
        if (resourceSearchInput) resourceSearchInput.focus();
        else if (cancelModalBtn) cancelModalBtn.focus();
    }

    function closeAddResourceModal() {
        if (!addResourceModal) return;
        addResourceModal.classList.add('hidden');
        resetAddResourceModalInputsAndSelection();
        currentTargetActivityElementForResourceAdd = null;
    }

    // --- Add Resource Modal Input Handling ---
    function resetAddResourceModalInputsAndSelection() {
        if (resourceListModalEl) {
            const currentlySelected = resourceListModalEl.querySelector('.resource-item[aria-selected="true"]');
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
       const previouslySelected = resourceListModalEl.querySelector('.resource-item[aria-selected="true"]');
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
        if (resourceUrlValue.length > 0 && selectedResourceId !== null && resourceListModalEl) { // Added null check for resourceListModalEl
             const previouslySelected = resourceListModalEl.querySelector('.resource-item[aria-selected="true"]');
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
        if (!currentTargetActivityElementForResourceAdd) {
            console.error("Cannot add resource: Target activity element not set.");
            return;
        }
        // Updated selector to match the new HTML structure
        let resourceListElement = currentTargetActivityElementForResourceAdd.querySelector('.activity-resources-list');
        if (!resourceListElement) {
             console.warn("Could not find the resource list UL (.activity-resources-list) within the target activity:", currentTargetActivityElementForResourceAdd.dataset.activityId, ". Creating it.");
             const resourceDiv = currentTargetActivityElementForResourceAdd.querySelector('.mt-2.text-xs'); // Find the div containing resources area
             const addButton = resourceDiv ? resourceDiv.querySelector('.openModalBtn') : null; // Find the add button
             if(resourceDiv && addButton) {
                 const newUl = document.createElement('ul');
                 // Adjusted class names to match the new structure
                 newUl.className = 'list-disc pl-5 mt-1 activity-resources-list';
                 resourceDiv.insertBefore(newUl, addButton); // Insert the new UL before the button
                 resourceListElement = newUl;
             } else {
                 console.error("Could not find appropriate place to insert resource list UL in activity:", currentTargetActivityElementForResourceAdd.dataset.activityId)
                 return; // Can't find where to put the list
             }
        }
        const newLi = document.createElement('li');
        newLi.textContent = title;
        resourceListElement.appendChild(newLi);
        console.log(`Added resource "${title}" to activity ${currentTargetActivityElementForResourceAdd.dataset.activityId}`);
    }

    // --- Edit Episode Modal Visibility & Handling ---
    function openEditEpisodeModal(episodeCardElement) {
        if (!editEpisodeModal || !episodeCardElement) {
             console.error("Edit episode modal (#editEpisodeModal) or episode card element not found!");
             return;
        }
        const episodeId = episodeCardElement.dataset.episodeId;
        const currentTitleElement = episodeCardElement.querySelector('h3');
        const currentDescriptionElement = episodeCardElement.querySelector('p.text-gray-600');
        const currentTitle = currentTitleElement ? currentTitleElement.textContent.trim() : '';
        const currentDescription = currentDescriptionElement ? currentDescriptionElement.textContent.trim() : '';
        // TODO: Retrieve saved knowbits/skillbits based on episodeId and set selected options
        // const savedKnowbits = episodeCardElement.dataset.knowbits ? JSON.parse(episodeCardElement.dataset.knowbits) : [];
        // const savedSkillbits = episodeCardElement.dataset.skillbits ? JSON.parse(episodeCardElement.dataset.skillbits) : [];

        editingEpisodeIdInput.value = episodeId;
        editEpisodeTitleInput.value = currentTitle;
        editEpisodeDescriptionInput.value = currentDescription;

        // Clear previous selections and select saved ones (example)
        if(editEpisodeKnowbitsSelect) {
            Array.from(editEpisodeKnowbitsSelect.options).forEach(option => {
                // option.selected = savedKnowbits.includes(option.value);
                 option.selected = false; // Resetting for now
            });
        }
         if(editEpisodeSkillbitsSelect) {
            Array.from(editEpisodeSkillbitsSelect.options).forEach(option => {
                // option.selected = savedSkillbits.includes(option.value);
                option.selected = false; // Resetting for now
            });
         }

        editEpisodeModal.classList.remove('hidden');
        if(editEpisodeTitleInput) editEpisodeTitleInput.focus();
    }

    function closeEditEpisodeModal() {
        if (!editEpisodeModal) return;
        editEpisodeModal.classList.add('hidden');
        if (editEpisodeForm) editEpisodeForm.reset();
        if(editingEpisodeIdInput) editingEpisodeIdInput.value = '';
    }

    function handleSaveEpisodeChanges(event) {
        event.preventDefault();
        if (!editEpisodeForm || !episodesContainer || !editingEpisodeIdInput || !editEpisodeTitleInput || !editEpisodeDescriptionInput || !editEpisodeKnowbitsSelect || !editEpisodeSkillbitsSelect) {
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

        // Store updated knowbits/skillbits on the element's dataset (optional but good practice)
        // episodeCard.dataset.knowbits = JSON.stringify(selectedKnowbits);
        // episodeCard.dataset.skillbits = JSON.stringify(selectedSkillbits);

        closeEditEpisodeModal();
    }

    // --- Edit Learning Resource Modal Visibility & Handling (NEW) ---
    function openEditLearningResourceModal(activityElement) {
        if (!editLearningResourceModal || !activityElement) {
             console.error("Edit Learning Resource modal (#editLearningResourceModal) or activity element not found!");
             return;
        }
        const activityId = activityElement.dataset.activityId;

        // Retrieve current values from the activity element
        const currentTitleElement = activityElement.querySelector('.activity-title');
        const currentDescriptionElement = activityElement.querySelector('.activity-description'); // Assuming you add this class or similar
        const currentTypeElement = activityElement.querySelector('.activity-type');
        const currentLocationElement = activityElement.querySelector('.activity-location');
        const currentTimeElement = activityElement.querySelector('.activity-time');
        const currentDifficultyElement = activityElement.querySelector('.activity-difficulty');

        const currentTitle = currentTitleElement ? currentTitleElement.textContent.trim() : 'New Learning Activity';
        const currentDescription = currentDescriptionElement ? currentDescriptionElement.textContent.trim() : ''; // Default if description P element doesn't exist
        const currentType = currentTypeElement ? currentTypeElement.textContent.trim() : 'Individual Work'; // Default
        const currentLocation = currentLocationElement ? currentLocationElement.textContent.trim() : 'Classroom'; // Default
        const currentTime = currentTimeElement ? currentTimeElement.textContent.trim() : '?'; // Default
        const currentDifficulty = currentDifficultyElement ? currentDifficultyElement.textContent.trim() : '3'; // Default (matching option value)

        // Populate modal fields
        editingLearningResourceIdInput.value = activityId;
        lrTitleInput.value = currentTitle;
        lrDescriptionInput.value = currentDescription;
        lrTypeSelect.value = currentType; // Match the text content to the option value/text
        lrLocationSelect.value = currentLocation; // Match the text content to the option value/text
        lrTimeInput.value = currentTime === '?' ? '' : currentTime; // Don't show '?' in input
        lrDifficultySelect.value = currentDifficulty.match(/\d+/)?.[0] || '3'; // Extract number or default

        editLearningResourceModal.classList.remove('hidden');
        if(lrTitleInput) lrTitleInput.focus();
    }

    function closeEditLearningResourceModal() {
        if (!editLearningResourceModal) return;
        editLearningResourceModal.classList.add('hidden');
        if (editLearningResourceForm) editLearningResourceForm.reset();
        if(editingLearningResourceIdInput) editingLearningResourceIdInput.value = '';
    }

     function handleSaveLearningResourceChanges(event) {
        event.preventDefault();
        if (!editLearningResourceForm || !episodesContainer || !editingLearningResourceIdInput || !lrTitleInput || !lrDescriptionInput || !lrTypeSelect || !lrLocationSelect || !lrTimeInput || !lrDifficultySelect) {
             console.error("One or more elements needed for saving learning resource changes not found.");
             return;
        }
        const activityId = editingLearningResourceIdInput.value;
        const activityElement = episodesContainer.querySelector(`.activity-item[data-activity-id="${activityId}"]`);

        if (!activityElement) {
            console.error("Could not find activity item to update for ID:", activityId);
            closeEditLearningResourceModal();
            return;
        }

        const newTitle = lrTitleInput.value.trim() || 'New Learning Activity';
        const newDescription = lrDescriptionInput.value.trim(); // Keep description field if needed
        const newType = lrTypeSelect.value;
        const newLocation = lrLocationSelect.value;
        const newTime = lrTimeInput.value.trim() || '?';
        const selectedDifficultyOption = lrDifficultySelect.options[lrDifficultySelect.selectedIndex];
        const newDifficultyText = selectedDifficultyOption ? selectedDifficultyOption.textContent : '?'; // Get full text e.g., "3 (Medium)"
        const newDifficultyValue = selectedDifficultyOption ? selectedDifficultyOption.value : '?'; // Get value e.g., "3"

        console.log(`Saving changes for Activity ${activityId}: Title: ${newTitle}, Type: ${newType}, Loc: ${newLocation}, Time: ${newTime}, Diff: ${newDifficultyValue}`);

        // Update the Activity Item Display
        const titleElement = activityElement.querySelector('.activity-title');
        const detailsElement = activityElement.querySelector('.activity-details');
        // Optional: Add/Update a description element if you want to display it directly
        // const descriptionElement = activityElement.querySelector('.activity-description');
        // if (descriptionElement) descriptionElement.textContent = newDescription;

        if (titleElement) titleElement.textContent = newTitle;

        // Update the details string using the new values
        if (detailsElement) {
             // Update individual spans if they exist
            const typeSpan = detailsElement.querySelector('.activity-type');
            const locationSpan = detailsElement.querySelector('.activity-location');
            const timeSpan = detailsElement.querySelector('.activity-time');
            const difficultySpan = detailsElement.querySelector('.activity-difficulty');

            if (typeSpan) typeSpan.textContent = newType;
            if (locationSpan) locationSpan.textContent = newLocation;
            if (timeSpan) timeSpan.textContent = newTime;
            if (difficultySpan) difficultySpan.textContent = newDifficultyValue; // Just show the number value

            // Or rebuild the whole string (simpler if spans don't exist)
            // detailsElement.innerHTML = `Type: <span class="activity-type">${newType}</span> | Location: <span class="activity-location">${newLocation}</span> | Time: <span class="activity-time">${newTime}</span> | Difficulty: <span class="activity-difficulty">${newDifficultyValue}</span>`;
        }

        // Store updated values in data attributes (optional, but good practice)
        activityElement.dataset.title = newTitle;
        activityElement.dataset.type = newType;
        activityElement.dataset.location = newLocation;
        activityElement.dataset.time = newTime;
        activityElement.dataset.difficulty = newDifficultyValue;
        // activityElement.dataset.description = newDescription;

        closeEditLearningResourceModal();
    }

    // --- Trajectory Structure Creation Functions ---
    function createActivityElement(newActivityId, episodeId) {
        const activityLi = document.createElement('li');
        activityLi.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-md activity-item border border-gray-100';
        activityLi.dataset.activityId = newActivityId;
        activityLi.dataset.parentEpisodeId = episodeId;
        // Add initial data attributes for new activities
        activityLi.dataset.title = 'New Learning Activity';
        activityLi.dataset.type = 'Individual Work';
        activityLi.dataset.location = 'Classroom';
        activityLi.dataset.time = '?';
        activityLi.dataset.difficulty = '3';
        activityLi.dataset.description = '';

        activityLi.innerHTML = `
            <div class="flex-grow pr-4">
                <p class="text-sm font-medium text-gray-800 activity-title">New Learning Activity</p>
                <p class="text-xs text-gray-500 activity-details">Type: <span class="activity-type">Individual Work</span> | Location: <span class="activity-location">Classroom</span> | Time: <span class="activity-time">?</span> | Difficulty: <span class="activity-difficulty">3</span></p>
                 <div class="mt-2 text-xs">
                    <span class="font-medium">Resources:</span>
                    <ul class="list-disc pl-5 mt-1 activity-resources-list"></ul>
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
        const episodeCard = buttonElement.closest('.episode-card');
        if (episodeCard) {
          openEditEpisodeModal(episodeCard);
        } else console.error("Could not find parent episode card for edit button.");
    }

    function handleEditActivity(buttonElement) { // UPDATED to open the new modal
        const activityItem = buttonElement.closest('.activity-item');
        if (activityItem) {
            openEditLearningResourceModal(activityItem);
        } else {
            console.error("Could not find parent activity item for edit button.");
        }
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
            const editActivityBtn = target.closest('.edit-activity-btn'); // Now targets the button for the new modal
            const openModalBtn = target.closest('.openModalBtn'); // Add Resource button in activity

            if (addActivityBtn) handleAddActivity(addActivityBtn);
            else if (removeEpisodeBtn) handleRemoveEpisode(removeEpisodeBtn);
            else if (removeActivityBtn) handleRemoveActivity(removeActivityBtn);
            else if (editEpisodeBtn) handleEditEpisode(editEpisodeBtn);
            else if (editActivityBtn) handleEditActivity(editActivityBtn); // Call the correct handler
            else if (openModalBtn) {
                 const activityElement = target.closest('.activity-item');
                 if(activityElement) openAddResourceModal(activityElement); // Use the specific open function
                 else console.error("Could not find parent activity for 'Add Resource' button.");
            }
        });
    }

    // --- Add Resource Modal Listeners ---
    if (closeModalHeaderBtn) closeModalHeaderBtn.addEventListener('click', closeAddResourceModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeAddResourceModal);
    if (addResourceModal) addResourceModal.addEventListener('click', (event) => { if (event.target === addResourceModal) closeAddResourceModal(); });
    if (resourceListModalEl) { // Use renamed variable
        resourceListModalEl.addEventListener('click', (event) => handleResourceSelection(event.target.closest('.resource-item')));
        resourceListModalEl.addEventListener('keydown', (event) => {
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
    if (addResourceBtnModal) { // Use renamed variable
        addResourceBtnModal.addEventListener('click', () => {
            let resourceTitle = 'Unknown Resource';
            if (selectedResourceId !== null && resourceListModalEl) { // Added null check
                const selectedLiElement = resourceListModalEl.querySelector(`.resource-item[data-resource-id="${selectedResourceId}"]`);
                if (selectedLiElement) {
                    const titleElement = selectedLiElement.querySelector('.min-w-0 p');
                    resourceTitle = titleElement ? titleElement.textContent.trim() : resourceTitle;
                    addResourceToActivityList(resourceTitle);
                    closeAddResourceModal();
                } else { closeAddResourceModal(); }
            } else if (isValidUrl(resourceUrlInput?.value || '')) {
                resourceTitle = resourceUrlInput.value.trim();
                addResourceToActivityList(resourceTitle);
                closeAddResourceModal();
            } else { console.warn("Add resource button clicked, but no valid selection or URL found."); }
        });
    }

    // --- Edit Episode Modal Listeners ---
    if (editEpisodeForm) editEpisodeForm.addEventListener('submit', handleSaveEpisodeChanges);
    if (cancelEditEpisodeBtn) cancelEditEpisodeBtn.addEventListener('click', closeEditEpisodeModal);
    if (closeEditEpisodeModalBtn) closeEditEpisodeModalBtn.addEventListener('click', closeEditEpisodeModal);
    if (editEpisodeModal) editEpisodeModal.addEventListener('click', (event) => { if (event.target === editEpisodeModal) closeEditEpisodeModal(); });

    // --- Edit Learning Resource Modal Listeners (NEW) ---
    if (editLearningResourceForm) editLearningResourceForm.addEventListener('submit', handleSaveLearningResourceChanges);
    if (cancelEditLearningResourceBtn) cancelEditLearningResourceBtn.addEventListener('click', closeEditLearningResourceModal);
    if (closeEditLearningResourceModalBtn) closeEditLearningResourceModalBtn.addEventListener('click', closeEditLearningResourceModal);
    if (editLearningResourceModal) editLearningResourceModal.addEventListener('click', (event) => { if (event.target === editLearningResourceModal) closeEditLearningResourceModal(); });


    // --- Initial Setup ---
    resetAddResourceModalInputsAndSelection(); // Reset add resource modal state

}); // End of DOMContentLoaded