// --- CRITICAL FIX: Use a Try/Catch block to handle initialization failures. ---
try {
    // --- We remove the crashing line (var t = TrelloPowerUp.initialize();) ---
    // Instead, we use the stable iframe pattern which passes the client object as 'tClient'.
    TrelloPowerUp.iframe().render(function(tClient){ 
        
        // --- CRITICAL DEFENSIVE CHECK ---
        // 'tClient' is the object passed by the Trello framework. We ensure it's defined.
        if (!tClient) {
            console.error("Initialization Failed: Trello client object is undefined inside render.");
            // Display internal error and stop.
            document.getElementById('settingsForm').before(document.createTextNode("Fatal Error: Client initialization failed internally."));
            document.getElementById('settingsForm').style.display = 'none';
            return; 
        }
        
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
                // No saved key found (expected on first run).
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

} catch (error) {
    // === CATCH BLOCK EXECUTES ONLY IF THE IFRAME SETUP ITSELF FAILS ===
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.fontWeight = 'bold';
    errorMessage.innerText = "CRITICAL ERROR: Power-Up initialization failed. This is likely a caching issue. Try a hard refresh (Ctrl+F5) on the Trello board, or try a different browser.";
    
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        // Display the error message above the form and hide the crashing elements
        settingsForm.before(errorMessage);
        settingsForm.style.display = 'none';
    }
    console.error("Fatal Initialization Crash:", error);
}
