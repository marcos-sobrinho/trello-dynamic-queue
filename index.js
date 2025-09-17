/* index.js */
window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    return [{
      icon: 'https://marcos-sobrinho.github.io/trello-dynamic-queue/4133506.png',
      text: 'Open Popup',
      callback: function(t) {
        return t.popup({
          title: 'Popup Example',
          url: 'https://marcos-sobrinho.github.io/trello-dynamic-queue/popup.html', // this must be listed in manifest.json
          height: 200
        });
      }
    }];
  }
});
