// --- CRITICAL FIX: The most minimal, stable pattern for settings. ---
// This relies purely on Trello passing the client object as the argument 'tClient'.

// The Trello Power-Up client object is passed here when the iframe is ready.
TrelloPowerUp.iframe().render(function(tClient){ 
    
    // --- CRITICAL DEFENSIVE CHECK ---
    // If tClient is undefined here, it means the Trello framework failed the connection.
    if (!tClient) {
        // Fallback for environmental failure
        console.error("Initialization Failed: Trello client object is undefined. Please clear cache.");
        document.getElementById('settingsForm').before(document.createTextNode("Fatal Error: Connection failed. Please hard refresh (Ctrl+F5) to reload."));
        document.getElementById('settingsForm').style.display = 'none';
        return; 
    }
    
    // If we reach here, the client is fully initialized and working.
    
    // --- STEP 1: Immediately signal Trello to size and render the iframe. ---
    tClient.sizeWindow(); 

    // --- STEP 2: Attempt to pre-fill the input field on load (Asynchronous) ---
    tClient.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            const inputElement = document.getElementById('gasSecretKey');
            if (key && inputElement) {
                inputElement.value = key;
            }
        })
        .catch(function(error) {
            console.error("No saved key found (expected on first run).", error);
        });

    // --- STEP 3: Set up the submit listener for the form ---
    document.getElementById('settingsForm').addEventListener('submit', function(event){
        // CRITICAL: Prevent the browser's default validation
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
        
        // Save the key securely in Trello's private storage using the working client object
        return tClient.set('board', 'private', 'gasSecretKey', key)
            .then(function() {
                // Show the success notification banner on the Trello board
                tClient.alert({ 
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
                    tClient.closePopup(); 
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
