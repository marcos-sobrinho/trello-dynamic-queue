/* === CONFIGURATION: FILL THESE IN === */
const TRELLO_DEV_API_KEY = '348e9fb57724f6deb0fdad9f261e36ca'; // Get this from Trello Dev Site
const GAS_ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbxm--aVDnHHhospao_ct4WAOio5Myvsj51MnhGrBZ-2A5wXUTbCtZl8qkRch5_n6XJ39Q/exec'; // e.g., https://script.google.com/macros/s/ABCD12345/exec
/* ==================================== */

var t = TrelloPowerUp.initialize({
    // Defines the button that appears on the board header
    'board-buttons': function(t) {
        return [{
            text: 'Setup Queue Automation',
            icon: {
                dark: './images/icon-dark.svg', // Ensure you have this path/file
                light: './images/icon-light.svg'
            },
            callback: function(t) {
                // Call the function to create the Webhook and authorize the user
                return createWebhook(t);
            }
        }];
    },
    // Defines the gear icon in the Power-Up menu for settings
    'show-settings': function(t) {
        return t.popup({
            title: 'GAS Secret Key Setup',
            url: './settings.html', // Points to the file below
            height: 140
        });
    }
});

/**
 * Step 1: Requests Trello authorization and attempts to create the Webhook.
 * @param {object} t The Trello Power-Up client object.
 */
function createWebhook(t) {
    // Check if the GAS Secret Key is set before attempting authorization
    return t.get('board', 'private', 'gasSecretKey')
        .then(secretKey => {
            if (!secretKey) {
                // Fails early if the key is missing, directing the user to settings
                return t.alert({
                    message: 'ERROR: Please set your GAS Secret Key in the Power-Up Settings (gear icon) first.',
                    duration: 10,
                    display: 'error'
                });
            }

            // 1. Request write permissions (needed to create a Webhook)
            return t.authorize({
                type: 'full',
                scope: 'read,write',
                expiration: 'never'
            })
            .then(token => {
                // 2. Get the current board ID
                return t.get('board', 'id')
                    .then(boardId => [boardId, token, secretKey]); // Pass all necessary data
            })
            .then(([boardId, token, secretKey]) => {
                // 3. Call the Trello REST API to create the webhook
                const url = `https://api.trello.com/1/webhooks/`;
                const body = {
                    key: TRELLO_DEV_API_KEY,
                    token: token,
                    callbackURL: GAS_ENDPOINT_URL, // The URL Trello will notify
                    idModel: boardId, // The board to watch for changes
                    description: `Continuous Queue for Board: ${boardId}`,
                    secret: secretKey // The key Trello will use to sign its messages
                };

                return fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            })
            .then(response => {
                if (response.ok) {
                    return t.alert({ message: 'Webhook successfully created! Automation is now live.', duration: 5, display: 'success' });
                } else {
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .catch(error => {
                console.error('Webhook setup failed:', error);
                return t.alert({ message: `Webhook setup failed. Ensure your GAS URL and Key are correct. Error: ${error.message}`, duration: 15, display: 'error' });
            });
        });
}

// NOTE: You would typically include a manual run button here as a fallback,
// but for a truly continuous system, the Webhook is the primary driver.
