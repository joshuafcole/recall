var _ = require('underscore');
var ltrap = require('ltrap');
var gui = ltrap.params.nwRequire('nw.gui');
var appWindow = gui.Window.get();

var tabs = require('./tabs');
var workspace = require('./workspace');

var recall = module.exports = {};

/**
 * Represents a tab as a JSON-serializable object.
 */
function serializeTab(tab) {
  var serial = {};
  if(!tab) {
    return;
  }

  var ed = tabs.getEditor(tab);
  if(!ed) {
    return;
  }

  serial.path = tabs.getPath(tab);
  serial.cursor = ed.getCursor();
  return serial;

}

/**
 * Gets the contents of the active workspace in LT.
 */
recall.getWorkspace = function() {
  var ws = {
    protocol: 2,
    tabsets: _.map(tabs.getTabsets(), function(tabset) {
      var tabObjs = tabs.getTabs(tabset);
      return {
        tabs: _.compact(_.map(tabObjs, serializeTab)),
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
  if(!ws) {
    return false;
  }

  for(var i = 0; i < ws.tabsets.length; i++) {
    var tabset = ws.tabsets[i];
    if(i !== 0) {
      ltrap.execCommand('tabset.new');
      ltrap.execCommand('tabset.next');
    }

    _.each(tabset.tabs, function(tab) {
      // Bail on non-file backed tabs.
      if(!tab.path) {
        return;
      }

      ltrap.execCommand('open-path', tab.path);
      var activeTab = tabs.getActiveTab();

      // Ensure we successfully opened the tab.
      if(!activeTab || tabs.getPath(activeTab) !== tab.path) {
        return;
      }

      // Restore tab state.
      var ed = tabs.getEditor(activeTab);
      ed.setCursor(tab.cursor);
    });

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
    if(err || !ws) {
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
