var queue = (function() {
  const LABEL_WINDOWS = {
    "red": 3,
    "yellow": 7,
    "green": 20,
    "white": 45
  };

  async function generateJSON(t) {
    // Fetch all cards on the board
    const cards = await t.cards('all');
    
    // Map cards to JSON with virtual deadlines
    const now = new Date();
    const result = cards.map(card => {
      let due = card.due ? new Date(card.due) : null;
      let virtualDue = null;

      // Determine virtual due based on label if no real due date
      if (!due) {
        let label = card.labels && card.labels[0] ? card.labels[0].color : 'white';
        let days = LABEL_WINDOWS[label] || 45;
        virtualDue = new Date(now.getTime() + days * 24*60*60*1000);
      }

      return {
        id: card.id,
        name: card.name,
        label: card.labels && card.labels[0] ? card.labels[0].color : null,
        due: due,
        virtualDue: virtualDue,
        desc: card.desc
      };
    });

    // Sort by nearest virtual due date first
    result.sort((a, b) => {
      let aDate = a.due || a.virtualDue;
      let bDate = b.due || b.virtualDue;
      return aDate - bDate;
    });

    return result;
  }

  return { generateJSON };
})();
