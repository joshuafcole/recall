var path = require('path');
var fs = require('fs');
var _ = require('underscore');


module.exports = function(window, params) {
  // LT Requires
  var lt = window.lt;
  var localRoot = params.root;
  var ltrap = require('ltrap')(window, localRoot);
  var gui = params.nwRequire('nw.gui');
  var appWindow = gui.Window.get();
  var ignore = ltrap.ignore;

  var recall = {};

  recall.init = function() {
    //No op
    return false;
  };

  // Mapping of workspace names to workspace paths. This will eventually be user configurable.
  recall.workspaces = {
    'default': path.join(localRoot, 'workspaces', 'default.json')
  };

  /*\
  |*| Gets the contents of the active workspace in LT.
  \*/
  recall.getWorkspace = function() {
    var contents = {
        protocol: 0,
        tabs: ltrap.getTabs(),
        lastActive: ltrap.getActiveFile()
      };

    return contents;
  };

  recall.setWorkspace = function(workspace) {
  }

  /*\
  |*| Loads the given contents into the active workspace in LT.
  \*/
  recall.setWorkspace = function(contents) {
    for(var i = 0; i < contents.tabs.length; i++) {
      var tabset = contents.tabs[i];
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
  recall.save = function(workspace) {
    var wsPath = recall.workspaces[workspace];
    ignore(_.partial(fs.mkdirSync, path.dirname(wsPath)), 'EEXIST'); // If the directory exists we're good.
    ignore(_.partial(fs.unlinkSync, wsPath), 'ENOENT'); // If the file doesn't already exist we're good.
    fs.writeFileSync(wsPath, JSON.stringify(recall.getWorkspace()));
  };

  /*\
  |*| Reads the specified workspace file into the active workspace.
  \*/
  recall.load = function(workspace) {
    fs.readFile(recall.workspaces[workspace], function(err, data) {
      if(err) {
        if(err.code === 'ENOENT') {
          return;
        }
        throw err;
      }

      // @TODO: Consider if this can be better handled when erroring.
      recall.setWorkspace(JSON.parse(data));
    });
  };

  // Bind events.
  // @TODO: Configure these as default behaviors instead of hardcoded events.
  recall.load('default');

  appWindow.on('close', function(event) {
    recall.save('default');
  });

  return recall;
};
