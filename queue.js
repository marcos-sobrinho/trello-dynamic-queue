const t = TrelloPowerUp.iframe();

async function outputQueue() {
  try {
    const cards = await t.cards('all');

    const data = (cards || []).map(c => ({
      id: c.id,
      name: c.name,
      labels: c.labels,
      due: c.due,
      url: c.url,
      urgencyScore: calculateUrgency(c)
    }));

    // Replace the page with raw JSON so Apps Script can fetch it
    document.open();
    document.write(JSON.stringify(data));
    document.close();

  } catch (err) {
    document.open();
    document.write(JSON.stringify({ error: err.message }));
    document.close();
  }
}

function calculateUrgency(card) {
  let score = 0;
  if (card.labels.includes("High")) score += 5;
  if (card.labels.includes("Medium")) score += 3;
  if (card.labels.includes("Low")) score += 1;

  const dueDate = card.due ? new Date(card.due) : new Date(Date.now() + 45*24*60*60*1000);
  const daysLeft = (dueDate - new Date()) / (1000*60*60*24);
  score += Math.max(0, 20 - daysLeft);
  return score;
}

outputQueue();
