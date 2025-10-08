// Note: The global TrelloPowerUp.initialize() call that was crashing the script has been removed.

// Use TrelloPowerUp.iframe() to get the specific client context for this settings frame,
//Identifier
// and then use render() to execute logic only when Trello confirms the frame is loaded.
TrelloPowerUp.iframe().render(function(){
    // CRITICAL FIX: Inside render(), 'this' is the Trello client object we need.
    var t = this; 
    
    // --- Step 1: Pre-fill the input field on load ---
    // t.get is now reliably available.
    t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            const inputElement = document.getElementById('gasSecretKey');
            if (key && inputElement) {
                inputElement.value = key;
            }
        });

    // --- Step 2: Set up the submit listener for the form ---
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

