var _ = require('underscore');

var migrations = {
  0: function(ws) {
    ws.protocol = 1;
    ws.tabsets = _.map(ws.tabs, function(tabs) {
      return {tabs: tabs};
    });
    delete ws.tabs;
    delete ws.lastActive;

    return ws;
  },
  1: function(ws) {
    ws.protocol = 2;
    ws.tabsets = _.map(ws.tabsets, function(tabset) {
      tabset.tabs = _.map(tabset.tabs, function(tabPath) {
        return {
          path: tabPath,
          cursor: {line: 0, ch: 0}
        };
      });

      return tabset;
    });

    return ws;
  }
};

var current = _.size(migrations);

module.exports = function migrate(ws) {
  if(!ws || typeof ws !== 'object') {
    return ws;
  }

  var deathloopGuard = 0;
  if(ws.protocol !== current) {
    console.log('Recall migrating old workspace...');
    console.log('Protocol', ws.protocol);
    console.log(JSON.stringify(ws, null, 2));
  }

  while(ws.protocol !== current) {
    ws = migrations[ws.protocol](ws);

    console.log('Protocol', ws.protocol);
    console.log(JSON.stringify(ws, null, 2));

    if(deathloopGuard > 999) {
      throw new Error('Recall: Something has gone horribly awry in the migration process.');
    }
    deathloopGuard++;
  }

  return ws;
};


