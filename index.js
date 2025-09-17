/* global TrelloPowerUp */
var t = TrelloPowerUp.iframe();

console.log("Popup loaded, Trello iframe context active.");

document.getElementById('generate').addEventListener('click', function() {
  t.board('all')
    .then(boardData => {
      // Use your queue.js logic
      const queued = calculateQueue(boardData);
      document.getElementById('output').textContent = JSON.stringify(queued, null, 2);

      // Optional: send to Google Apps Script
      fetch("YOUR_GOOGLE_APPS_SCRIPT_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queued)
      })
      .then(res => console.log("Sync success", res))
      .catch(err => console.error("Sync error", err));
    })
    .catch(err => console.error("Error fetching board data", err));
});
