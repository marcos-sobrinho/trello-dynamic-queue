/* index.js */
var Promise = TrelloPowerUp.Promise;

// Entry point: declare what this Power-Up does
window.TrelloPowerUp.initialize({

  // Add a button at the top of the board
  'board-buttons': function (t, opts) {
    return [{
      icon: 'https://marcos-sobrinho.github.io/trello-dynamic-queue/4133506.png',
      text: 'Dynamic Queue',
      callback: function (t) {
        return t.popup({
          title: 'Dynamic Queue',
          url: 'popup.html', // opens your popup
          height: 400
        });
      }
    }];
  }

});
