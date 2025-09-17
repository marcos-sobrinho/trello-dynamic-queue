/* global TrelloPowerUp */

var t = window.TrelloPowerUp.iframe();

// Replace with your board ID (from board URL: trello.com/b/{boardId}/...)
const BOARD_ID = "YOUR_BOARD_ID_HERE";

async function fetchQueue() {
  try {
    // Public Trello API endpoint: lists + cards for the board
    const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards?fields=name,due,idList`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cards = await res.json();

    // Example: organize by deadline
    const queue = cards
      .filter(c => c.due) // only cards with deadlines
      .sort((a, b) => new Date(a.due) - new Date(b.due))
      .map(c => ({
        card: c.name,
        deadline: c.due,
        list: c.idList
      }));

    return queue;
  } catch (err) {
    console.error("Error fetching Trello data:", err);
    return [{ error: err.message }];
  }
}

// Attach the click handler
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('generate').addEventListener('click', async function() {
    const queue = await fetchQueue();
    document.getElementById('output').textContent = JSON.stringify(queue, null, 2);
  });
});

// This is referenced in manifest.json
window.boardButtonCallback = function(t) {
  return t.popup({
    title: "Dynamic Queue",
    url: './popup.html',
    height: 400
  });
};
