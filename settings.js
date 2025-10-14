// --- CRITICAL FIX: Use the simple initialization method outside of render. ---
// This returns the client object if called inside an iframe context.
var t = TrelloPowerUp.initialize();

// Now, we call render on that client object to wait for the iframe environment to be ready.
t.render(function(){ 
    
    // 'this' inside t.render() is the Trello client object. We assign it to 'tClient' for clarity.
    var tClient = this;
    
    // --- CRITICAL DEFENSIVE CHECK (STILL NECESSARY) ---
    if (!tClient) {
        console.error("Initialization Failed: Trello client object (tClient) is undefined. Cannot run settings script.");
        return; 
    }
    
    // --- STEP 1: Immediately signal Trello to size and render the iframe. ---
    // This should now execute correctly as tClient is defined.
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
