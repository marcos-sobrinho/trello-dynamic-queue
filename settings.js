var t = TrelloPowerUp.initialize();

t.render(function(){
    // On render, try to retrieve and display the key if it exists
    return t.get('board', 'private', 'gasSecretKey')
        .then(function(key) {
            if (key) {
                // Use .value to pre-fill the input field
                document.getElementById('gasSecretKey').value = key;
            }
        });
});

document.getElementById('settingsForm').addEventListener('submit', function(event){
    event.preventDefault();
    const key = document.getElementById('gasSecretKey').value;
    
    // Save the key privately to the board's data
    return t.set('board', 'private', 'gasSecretKey', key)
        .then(function() {
            // Show a success message and close the pop-up
            t.alert({ message: 'Secret Key saved successfully!', duration: 3, display: 'success' });
            t.closePopup();
        });
});

// NOTE: You must also create a settings.html file containing a form with
// an input field id="gasSecretKey" and a button inside a form id="settingsForm".
