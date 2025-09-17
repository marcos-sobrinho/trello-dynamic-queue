/* global TrelloPowerUp */
var t = TrelloPowerUp.iframe();

// --- queue.js logic ---
function labelToDays(label) {
  switch (label?.toLowerCase()) {
    case 'red': return 3;
    case 'yellow': return 7;
    case 'green': return 20;
    case 'white': return 45;
    default: return 45; // no label → white window
  }
}

function labelToScore(label) {
  switch (label?.toLowerCase()) {
    case 'red': return 4;
    case 'yellow': return 3;
    case 'green': return 2;
    case 'white': return 1;
    default: return 2; // default medium
  }
}

function daysUntil(dueDate, virtualDays) {
  if (!dueDate) return virtualDays;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateQueue(boardData) {
  const queue = [];

  boardData.lists.forEach(list => {
    if (!list.cards) return;
    list.cards.forEach(card => {
      const labelName = card.labels?.[0]?.name || 'white';
      const virtualDays = labelToDays(labelName);
      const labelScore = labelToScore(labelName);
      const days = daysUntil(card.due, virtualDays);
      const deadlineScore = 1 / Math.max(days, 1);
      const priorityScore = labelScore + deadlineScore;

      queue.push({
        id: card.id,
        name: card.name,
        listName: list.name,
        due: card.due || null,
        label: labelName,
        priorityScore: priorityScore
      });
    });
  });

  queue.sort((a, b) => b.priorityScore - a.priorityScore);
  return queue;
}

// --- Generate JSON dynamically ---
async function generateJSON() {
  try {
    const boardData = await t.board('all');
    const queue = calculateQueue(boardData);

    // Output JSON dynamically for fetch
    document.body.innerText = JSON.stringify(queue, null, 2);
  } catch (err) {
    console.error(err);
    document.body.innerText = JSON.stringify({ error: err.message });
  }
}

// Run on load
generateJSON();
