// queue.js
var t = window.TrelloPowerUp.iframe();

// Virtual deadline windows (in days)
const LABEL_DEADLINES = {
  'red': 3,
  'yellow': 7,
  'green': 20,
  'white': 45
};

// Helper: add days to a date
function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Compute "virtual due date"
function computeVirtualDueDate(card) {
  const today = new Date();

  // 1) Use actual due date if card has one
  if (card.due) {
    return new Date(card.due);
  }

  // 2) Use labels if no due date
  if (card.labels && card.labels.length > 0) {
    const label = card.labels[0].color; // take first label
    const days = LABEL_DEADLINES[label];
    if (days) {
      return addDays(today, days);
    }
  }

  // 3) If no labels & no due date → evolve with age
  const created = card.dateLastActivity ? new Date(card.dateLastActivity) : today;
  const ageInDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));

  if (ageInDays < 3) return addDays(created, 3);
  if (ageInDays < 7) return addDays(created, 7);
  if (ageInDays < 20) return addDays(created, 20);
  return addDays(created, 45);
}

// Generate JSON when button is clicked
document.getElementById('generate').addEventListener('click', function () {
  Promise.all([
    t.board('all'),
    t.lists('all'),
    t.cards('all')
  ])
  .then(function (results) {
    const board = results[0];
    const lists = results[1];
    const cards = results[2];

    // Attach virtual deadlines
    const processed = cards.map(card => ({
      id: card.id,
      name: card.name,
      list: lists.find(l => l.id === card.idList)?.name || "Unknown",
      labels: card.labels.map(l => l.color),
      due: card.due,
      virtualDue: computeVirtualDueDate(card)
    }));

    // Sort by virtual due date
    processed.sort((a, b) => new Date(a.virtualDue) - new Date(b.virtualDue));

    // Output JSON
    document.getElementById('output').textContent =
      JSON.stringify(processed, null, 2);
  })
  .catch(function (err) {
    console.error("Error generating queue:", err);
  });
});
