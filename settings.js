// Initialize Trello Power-Up without immediate assignment.
// This is more stable for the settings context.
TrelloPowerUp.initialize();

// Use TrelloPowerUp.iframe() to get the specific context for this iframe,
// and then use render() to execute logic when the context is fully loaded.
TrelloPowerUp.iframe().render(function(){
    // CRITICAL FIX: 'this' inside render() is the Trello client object.
    // We assign it to 't' locally for use in the function.
    var t = this; 
    
    // --- Step 1: Pre-fill the input field on load ---
    // Note: t.get is now reliably available because we are inside render().
    t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            const inputElement = document.getElementById('gasSecretKey');
            // Your selected code is now correctly nested here:
            if (key && inputElement) {
                inputElement.value = key;
            }
        });

    // --- Step 2: Set up the submit listener for the form ---
    document.getElementById('settingsForm').addEventListener('submit', function(event){
        // CRITICAL: This now runs first, suppressing the browser's default validation message ("Preencha esse campo")
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
