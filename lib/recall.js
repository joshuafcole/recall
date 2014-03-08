var _ = require('underscore');
var workspace = require('./workspace');

module.exports = function(window, params) {
  // LT Requires
  var localRoot = params.root;
  var ltrap = require('ltrap')(window, localRoot);
  var gui = params.nwRequire('nw.gui');
  var appWindow = gui.Window.get();

  var recall = {};

  recall.init = function() {
    //No op
    return false;
  };

  /*\
  |*| Gets the contents of the active workspace in LT.
  \*/
  recall.getWorkspace = function() {
    var ws = {
        protocol: 0,
        tabs: ltrap.getTabs(),
        lastActive: ltrap.getActiveFile()
      };

    return ws;
  };

  /*\
  |*| Loads the given contents into the active workspace in LT.
  \*/
  recall.setWorkspace = function(ws) {
    for(var i = 0; i < ws.tabs.length; i++) {
      var tabset = ws.tabs[i];
      if(i !== 0) {
        ltrap.execCommand('tabset.new');
        ltrap.execCommand('tabset.next');
      }

      _.each(tabset, _.partial(ltrap.execCommand, 'open-path'));
    }
  };

  /*\
  |*| Writes the active workspace to the specified file in the workspaces map.
  |*| @NOTE: Synchronous due to an issue within LT exiting before async events finish pumping.
  \*/
  recall.save = function(name) {
    workspace.save(name, recall.getWorkspace());
  };

  /*\
  |*| Reads the specified workspace file into the active workspace.
  \*/
  recall.load = function(name) {
    workspace.load(name, function(err, ws) {
      if(err) {
        return;
      }
      recall.setWorkspace(ws);
    });
  };

  // Bind events.
  // @TODO: Configure these as default behaviors instead of hardcoded events.
  recall.load('default');

  appWindow.on('close', function() {
    recall.save('default');
  });

  return recall;
};
