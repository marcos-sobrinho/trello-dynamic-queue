/* global TrelloPowerUp */

var t = window.TrelloPowerUp.iframe();

// Attach the click handler when popup loads
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('generate').addEventListener('click', function() {
    // Example "organized queue" object
    const queue = [
      { card: "Task 1", deadline: "2025-09-20" },
      { card: "Task 2", deadline: "2025-09-25" }
    ];
    document.getElementById('output').textContent = JSON.stringify(queue, null, 2);
  });
});

// This function is referenced in manifest.json for the board button
window.boardButtonCallback = function(t) {
  return t.popup({
    title: "Dynamic Queue",
    url: './popup.html',
    height: 400
  });
};
