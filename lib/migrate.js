var _ = require('underscore');

var migrations = {
  0: function(ws) {
    ws.protocol = 1;
    ws.tabsets = _.map(ws.tabs, function(tabs) {
      return {tabs: tabs};
    });
    delete ws.tabs;
    delete ws.lastActive;
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

    if(deathloopGuard > 9999) {
      throw new Error('Recall: Something has gone horribly awry in the migration process.');
    }
    deathloopGuard++;
  }

  return ws;
};


