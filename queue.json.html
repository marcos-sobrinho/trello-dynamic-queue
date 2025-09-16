<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Queue JSON</title>
<script src="https://p.trellocdn.com/power-up.min.js"></script>
<script>
const t = TrelloPowerUp.iframe();

async function outputJSON() {
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

    // Overwrite the whole page with pure JSON
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

outputJSON();
</script>
</head>
<body>
</body>
</html>
