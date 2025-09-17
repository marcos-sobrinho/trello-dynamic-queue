// queue.js

// Map label to virtual due days
function labelToDays(label) {
  switch (label?.toLowerCase()) {
    case 'red': return 3;
    case 'yellow': return 7;
    case 'green': return 20;
    case 'white': return 45;
    default: return 45; // no label → white window
  }
}

// Map label to numeric priority
function labelToScore(label) {
  switch (label?.toLowerCase()) {
    case 'red': return 4;
    case 'yellow': return 3;
    case 'green': return 2;
    case 'white': return 1;
    default: return 2; // default medium
  }
}

// Calculate days until deadline or virtual
function daysUntil(dueDate, virtualDays) {
  if (!dueDate) return virtualDays;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Main priority queue generator
function calculateQueue(boardData) {
  const queue = [];

  boardData.lists.forEach(list => {
    if (!list.cards) return;
    list.cards.forEach(card => {
      // Get first label or default to white
      const labelName = card.labels?.[0]?.name || 'white';
      const virtualDays = labelToDays(labelName);
      const labelScore = labelToScore(labelName);

      // Days until due or virtual
      const days = daysUntil(card.due, virtualDays);

      // Urgency factor: closer → higher
      const deadlineScore = 1 / Math.max(days, 1);

      // Combined priority
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

  // Sort by priority descending
  queue.sort((a, b) => b.priorityScore - a.priorityScore);

  return queue;
}
