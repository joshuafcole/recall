(function recallBootstrap(window) {
  // LT Requires
  var lt = window.lt;
  var path = require('path');
  var fs = require('fs');
  var gui = require('nw.gui');
  var appWindow = gui.Window.get();


  // Local Requires
  var localRoot = path.join(lt.util.load.pwd, 'plugins', 'recall');
  var ltrap = require(path.join(localRoot, 'node_modules', 'ltrap'))(window, localRoot);
  var requireLocal = ltrap.requireLocal;
  var ignore = ltrap.ignore;
  var _ = requireLocal('underscore');
  var $ = requireLocal('jquery');


  var recall = window.recall || {};
  // Makes it easier to tweak live by piping into LTUI. Can be disabled
  // or moved if NS pollution is an issue.
  window.recall = recall;
  if(recall.initialized) {
    return recall;
  }
  recall.initialized = true;

  // Mapping of workspace names to workspace paths. This will eventually be user configurable.
  recall.workspaces = {
    'default': path.join(localRoot, 'workspaces', 'default.json')
  };

  /*\
  |*| Gets the contents of the active workspace in LT.
  \*/
  recall.getWorkspace = function(workspace) {
    var contents;

    if(!workspace) {
      contents = {
        protocol: 0,
        tabs: ltrap.getTabs(),
        lastActive: ltrap.getActiveFile()
      };
    }
    else {
      contents = 'MULTIPLE WORKSPACES NOT YET IMPLEMENTED.';
    }

    return contents;
  };

  /*\
  |*| Loads the given contents into the active workspace in LT.
  \*/
  recall.setWorkspace = function(contents) {
    for(var i = 0; i < contents.tabs.length; i++) {
      var tabset = contents.tabs[i];
      if(i !== 0) {
        ltrap.command('tabset.new');
        ltrap.command('tabset.next');
      }

      _.each(tabset, _.partial(ltrap.command, 'open-path'));
    }
  };

  /*\
  |*| Writes the active workspace to the specified file in the workspaces map.
  |*| @NOTE: Synchronous due to an issue within LT exiting before async events finish pumping.
  \*/
  recall.write = function(workspace) {
    var wsPath = recall.workspaces[workspace];
    ignore(_.partial(fs.mkdirSync, path.dirname(wsPath)), 'EEXIST'); // If the directory exists we're good.
    ignore(_.partial(fs.unlinkSync, wsPath), 'ENOENT'); // If the file doesn't already exist we're good.
    fs.writeFileSync(wsPath, JSON.stringify(recall.getWorkspace()));
  };

  /*\
  |*| Reads the specified workspace file into the active workspace.
  \*/
  recall.read = function(workspace) {
    fs.readFile(recall.workspaces[workspace], function(err, data) {
      if(err) {
        throw err;
      }

      // @TODO: Consider if this can be better handled when erroring.
      recall.setWorkspace(JSON.parse(data));
    });
  };

  // Bind events.
  // @TODO: Configure these as default behaviors instead of hardcoded events.
  $(document).ready(function() {
    recall.read('default');
  });

  appWindow.on('close', function(event) {
    recall.write('default');
  });
})(window);
