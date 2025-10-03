var t = TrelloPowerUp.initialize();

t.render(function(){
    // Runs when the pop-up window first opens
    return t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            // If a key is already saved, pre-fill the input box
            if (key) {
                // Ensure the element exists before trying to access it
                const inputElement = document.getElementById('gasSecretKey');
                if (inputElement) {
                    inputElement.value = key;
                }
            }
        });
});

// Listener that activates when the "Save Key" button is clicked (form submit)
document.getElementById('settingsForm').addEventListener('submit', function(event){
    event.preventDefault(); // Stop the form from doing a traditional page reload
    
    const key = document.getElementById('gasSecretKey').value.trim();
    const saveMessage = document.getElementById('saveMessage'); // Get the message element

    // Simple validation
    if (key.length === 0) {
        if (saveMessage) {
            saveMessage.innerText = 'Error: Secret Key cannot be empty.';
            saveMessage.style.color = 'red';
        }
        return;
    }
    
    // Saves the key securely in Trello's private storage for the current board
    return t.set('board', 'private', 'gasSecretKey', key)
        .then(function() {
            // 1. Show the success notification banner on the Trello board
            t.alert({ 
                message: 'Setup successful! Key saved. You must now HARD REFRESH the Trello board to clear cache.', 
                duration: 10, 
                display: 'success' 
            });
            
            // 2. Show in-modal confirmation
            if (saveMessage) {
                saveMessage.innerText = '✅ Saved! Closing window...';
                saveMessage.style.color = 'green';
            }

            // 3. Close the settings pop-up after a slight delay
            window.setTimeout(function() {
                t.closePopup(); 
            }, 500);
        })
        .catch(function(error) {
             // Handle any errors during the saving process
             if (saveMessage) {
                 saveMessage.innerText = `Error saving key: ${error.message}`;
                 saveMessage.style.color = 'red';
             }
        });
});
