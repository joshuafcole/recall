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
      return _.map(tabset, function(tabPath) {
        return {
          path: tabPath,
          cursor: {line: 0, ch: 0}
        };
      });
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
  while(ws.protocol !== current) {
    ws = migrations[ws.protocol](ws);

    if(deathloopGuard > 999) {
      throw new Error('Recall: Something has gone horribly awry in the migration process.');
    }
    deathloopGuard++;
  }

  return ws;
};


