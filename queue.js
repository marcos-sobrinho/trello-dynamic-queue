function calculateQueue(boardData) {
  // Example: map lists into simple queue objects
  return boardData.lists.map(list => ({
    id: list.id,
    name: list.name,
    cards: list.cards ? list.cards.map(card => ({
      id: card.id,
      name: card.name,
      due: card.due || null
    })) : []
  }));
}
