var _ = require('underscore');
var ltrap = require('ltrap');
var gui = ltrap.params.nwRequire('nw.gui');
var appWindow = gui.Window.get();

var tabs = require('./tabs');
var workspace = require('./workspace');

var recall = module.exports = {};

/**
 * Gets the contents of the active workspace in LT.
 */
recall.getWorkspace = function() {
  var ws = {
    protocol: 1,
    tabsets: _.map(tabs.getTabsets(), function(tabset) {
      return {
        tabs: _.map(tabs.getTabs(tabset), tabs.getPath),
        lastActive: tabs.getPath(tabs.getActiveTab(tabset))
      };
    })
  };

  return ws;
};

/**
 * Loads the given contents into the active workspace in LT.
 */
recall.setWorkspace = function(ws) {
  for(var i = 0; i < ws.tabsets.length; i++) {
    var tabset = ws.tabsets[i];
    if(i !== 0) {
      ltrap.execCommand('tabset.new');
      ltrap.execCommand('tabset.next');
    }

    _.each(tabset.tabs, _.partial(ltrap.execCommand, 'open-path'));

    // Focuses the last active tab in each tabset.
    ltrap.execCommand('open-path', tabset.lastActive);
  }
};

/**
 * Writes the active workspace to the specified file in the workspaces map.
 * @NOTE: Synchronous due to an issue within LT exiting before async events finish pumping.
 */
recall.save = function(name) {
  workspace.save(name, recall.getWorkspace());
};

/**
 * Reads the specified workspace file into the active workspace.
 */
recall.load = function(name) {
  workspace.load(name, function(err, ws) {
    if(err) {
      return;
    }
    recall.setWorkspace(ws);
  });
};

/**
 * Initialization
 */

// Bind events.
// @TODO: Configure these as default behaviors instead of hardcoded events.
recall.load('default');

appWindow.on('close', function() {
  recall.save('default');
});
