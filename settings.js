// Use TrelloPowerUp.iframe() to get the specific client context for this settings frame,
// and then use render() to execute logic only when Trello confirms the frame is loaded.
// CRITICAL FIX: We are now explicitly accepting the Trello client object as the argument 't'.
TrelloPowerUp.iframe().render(function(t){ 
    
    // --- CRITICAL DEFENSIVE CHECK (NEW) ---
    // If the Trello framework failed to provide the client object, stop execution immediately.
    if (!t) {
        console.error("Initialization Failed: Trello client object (t) is undefined. Cannot run settings script.");
        // If possible, you could display an error message in the HTML here, but returning is safest.
        return; 
    }
    
    // --- CRITICAL FIX: Immediately signal Trello to size and render the iframe. ---
    // This command is now protected by the 'if (!t)' check above.
    t.sizeWindow(); 

    // --- Step 1: Attempt to pre-fill the input field on load (Asynchronous) ---
    // We isolate the promise chain to prevent unhandled rejection from crashing the UI.
    t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            const inputElement = document.getElementById('gasSecretKey');
            // If a key is found, pre-fill the input box.
            if (key && inputElement) {
                inputElement.value = key;
            }
        })
        .catch(function(error) {
            // No saved key found (expected on first run). We log and suppress the rejection.
            console.error("No saved key found (expected on first run).", error);
        });

    // --- Step 2: Set up the submit listener for the form (Synchronous relative to render) ---
    document.getElementById('settingsForm').addEventListener('submit', function(event){
        // CRITICAL: This runs first, preventing the browser's default validation message ("Preencha esse campo")
        event.preventDefault(); 

        const key = document.getElementById('gasSecretKey').value.trim();
        const saveMessage = document.getElementById('saveMessage');

        // Simple validation
        if (key.length === 0) {
            if (saveMessage) {
                saveMessage.innerText = 'Error: Secret Key cannot be empty.';
                saveMessage.style.color = 'red';
            }
            return;
        }
        
        // Save the key securely in Trello's private storage
        return t.set('board', 'private', 'gasSecretKey', key)
            .then(function() {
                // Show the success notification banner on the Trello board
                t.alert({ 
                    message: 'Setup successful! Key saved. You must now HARD REFRESH the Trello board to clear cache.', 
                    duration: 10, 
                    display: 'success' 
                });
                
                // Show in-modal confirmation
                if (saveMessage) {
                    saveMessage.innerText = '✅ Saved! Closing window...';
                    saveMessage.style.color = 'green';
                }

                // Close the settings pop-up after a slight delay
                window.setTimeout(function() {
                    t.closePopup(); 
                }, 500);
            })
            .catch(function(error) {
                 if (saveMessage) {
                     saveMessage.innerText = `Error saving key: ${error.message}`;
                     saveMessage.style.color = 'red';
                 }
                 console.error("Save Key Error:", error);
            });
    });
});
