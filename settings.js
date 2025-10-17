// --- CRITICAL FIX: Hybrid Initialization with Context Passing ---
try {
    // 1. Initialize the client globally (Line 3, now Trello's failure point).
    // This MUST happen first, setting up the client object 't'.
    var t = TrelloPowerUp.initialize();

    // 2. Render the iframe content, using the globally initialized client 't'.
    // Trello is designed to pass the complete client object into 'this' when using t.render.
    t.render(function(){ 
        
        // We retrieve the client object from the 'this' context, which should be reliable.
        var tClient = this; 
        
        // --- CRITICAL DEFENSIVE CHECK ---
        if (!tClient) {
            // This case should not happen in a stable environment.
            console.error("Initialization Failed: Trello client object is undefined inside render.");
            document.getElementById('settingsForm').before(document.createTextNode("Fatal Error: Client object missing. Please try a hard refresh."));
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
                console.error("No saved key found (expected on first run).", error);
            });

        // --- STEP 3: Set up the submit listener for the form ---
        document.getElementById('settingsForm').addEventListener('submit', function(event){
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
            return tClient.set('board', 'private', 'gasSecretKey', key)
                .then(function() {
                    tClient.alert({ 
                        message: 'Setup successful! Key saved. You must now HARD REFRESH the Trello board to clear cache.', 
                        duration: 10, 
                        display: 'success' 
                    });
                    
                    if (saveMessage) {
                        saveMessage.innerText = '✅ Saved! Closing window...';
                        saveMessage.style.color = 'green';
                    }

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
    // === CATCH BLOCK EXECUTES IF TrelloPowerUp.initialize() FAILS ===
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.fontWeight = 'bold';
    errorMessage.innerText = "CRITICAL ERROR: Power-Up initialization failed. This is likely a caching issue. Try a hard refresh (Ctrl+F5) on the Trello board, or try a different browser.";
    
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.before(errorMessage);
        settingsForm.style.display = 'none';
    }
    console.error("Fatal Initialization Crash:", error);
}
