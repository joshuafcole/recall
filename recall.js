(function recallBootstrap(window) {
  // LT Requires
  var lt = window.lt;
  var path = require('path');
  var fs = require('fs');
  var gui = require('nw.gui');
  var appWindow = gui.Window.get();

  if(!lt.user_plugins) {
    lt.user_plugins = {};
  }


  // Local Requires
  if (fs.existsSync(path.join(lt.objs.plugins.user_plugins_dir, 'Recall'))){
    var localRoot = path.join(lt.objs.plugins.user_plugins_dir, 'Recall'); //When installed through the plugin manager, the Recall folder is created with an upper case
  }
  else
  {
    var localRoot = path.join(lt.objs.plugins.user_plugins_dir, 'recall'); //When recalled is manually cloned from the repository, the recall folder is created with a lower case
  }

  var ltrap = require(path.join(localRoot, 'node_modules', 'ltrap'))(window, localRoot);
  var ignore = ltrap.ignore;
  var _ = ltrap.require('underscore');


  var recall = lt.user_plugins.recall || {};
  if(recall.initialized) {
    return recall;
  }
  lt.user_plugins.recall = recall;
  recall.initialized = true;

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
})(window);
