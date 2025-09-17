document.addEventListener("DOMContentLoaded", () => {
  // Initialize Trello Power-Up iframe
  var t = TrelloPowerUp.iframe();

  async function generateQueue() {
    try {
      // Fetch full board info
      const boardData = await t.board('all');

      const queue = [];

      boardData.lists.forEach(list => {
        list.cards.forEach(card => {
          const labelName = card.labels?.[0]?.name || 'white';

          // Map labels to virtual due days
          const virtualDays = (() => {
            switch(labelName.toLowerCase()) {
              case 'red': return 3;
              case 'yellow': return 7;
              case 'green': return 20;
              case 'white': return 45;
              default: return 45;
            }
          })();

          const labelScore = (() => {
            switch(labelName.toLowerCase()) {
              case 'red': return 4;
              case 'yellow': return 3;
              case 'green': return 2;
              case 'white': return 1;
              default: return 2;
            }
          })();

          const now = new Date();
          const dueDate = card.due ? new Date(card.due) : null;
          const daysUntilDue = dueDate ? Math.ceil((dueDate - now)/(1000*60*60*24)) : virtualDays;
          const deadlineScore = 1 / Math.max(daysUntilDue, 1);

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
      queue.sort((a,b) => b.priorityScore - a.priorityScore);

      // Output JSON dynamically
      document.getElementById('output').innerText = JSON.stringify(queue, null, 2);

    } catch(err) {
      console.error(err);
      document.getElementById('output').innerText = JSON.stringify({ error: err.message });
    }
  }

  generateQueue();
});
