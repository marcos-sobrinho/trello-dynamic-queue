var t = TrelloPowerUp.initialize();

t.render(function(){
    // 1. On render, try to retrieve and display the key if it exists
    return t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            if (key) {
                document.getElementById('gasSecretKey').value = key;
            }
        });
});

document.getElementById('settingsForm').addEventListener('submit', function(event){
    event.preventDefault();
    const key = document.getElementById('gasSecretKey').value.trim();
    
    if (key.length === 0) {
        // Basic validation
        document.getElementById('saveMessage').innerText = 'Error: Secret Key cannot be empty.';
        document.getElementById('saveMessage').style.color = 'red';
        return;
    }
    
    // 2. Save the key privately to the board's data
    return t.set('board', 'private', 'gasSecretKey', key)
        .then(function() {
            // 3. Display success feedback (Trello-native alert)
            t.alert({ 
                message: 'Setup successful! Key saved. You must now HARD REFRESH the Trello board to clear cache.', 
                duration: 10, 
                display: 'success' 
            });
            
            // Optional: Provide in-modal confirmation before closing
            document.getElementById('saveMessage').innerText = '✅ Saved! Closing window...';
            document.getElementById('saveMessage').style.color = 'green';

            // 4. Close the settings pop-up after a slight delay
            window.setTimeout(function() {
                t.closePopup(); 
            }, 500);
        })
        .catch(function(error) {
             document.getElementById('saveMessage').innerText = `Error saving key: ${error.message}`;
             document.getElementById('saveMessage').style.color = 'red';
        });
});
