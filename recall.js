(function recallBootstrap(window) {
  // LT Requires
  var lt = window.lt;
  var path = require('path');
  var fs = require('fs');
  var gui = require('nw.gui');
  var appWindow = gui.Window.get();



  // Local Requires
  var localRoot = path.join(lt.util.load.pwd, 'plugins', 'recall');
  var util = require(path.join(localRoot, 'lib', 'util'))(window);
  var requireLocal = util.requireLocal;

  var _ = requireLocal('underscore');
  var $ = requireLocal('jquery');


  var recall = window.recall || {};
  window.recall = recall;
  if(recall.initialized) {
    return recall;
  }
  recall.initialized = true;

  recall.workspaces = {
    'default': path.join(localRoot, 'workspaces', 'default.json')
  };

  recall.getWorkspace = function(workspace) {
    var contents;

    if(!workspace) {
      contents = {
        protocol: 0,
        tabs: util.getTabs()
      };
    }
    else {
      contents = 'MULTIPLE WORKSPACES NOT YET IMPLEMENTED.';
    }

    return contents;
  };

  recall.setWorkspace = function(contents) {
    for(var i = 0; i < contents.tabs.length; i++) {
      var tabset = contents.tabs[i];
      if(i !== 0) {
        util.command('tabset.new');
        util.command('tabset.next');
      }

      _.each(tabset, util.open);
    }
  };

  function ignore(callback, code) {
    try {
      return callback();
    } catch (err) {
      if(err.code !== code) {
        throw err;
      }
    }
  }

  // Synchronous due to an issue within LT exiting before async events finish pumping.
  recall.write = function(workspace) {
    var wsPath = recall.workspaces[workspace];

    ignore(_.partial(fs.mkdirSync, path.dirname(wsPath)), 'EEXIST');
    ignore(_.partial(fs.unlinkSync, wsPath), 'ENOENT');
    fs.writeFileSync(wsPath, JSON.stringify(recall.getWorkspace()));
  };


  recall.read = function(workspace) {
    fs.readFile(recall.workspaces[workspace], function(err, data) {
      if(err) {
        throw err;
      }
      try {
        recall.setWorkspace(JSON.parse(data));
      } catch(err) {
        throw err;
      }

    });
  };

  // Bind events.
  $(document).ready(function() {
    recall.read('default');
  });

  appWindow.on('close', function(event) {
    recall.write('default');
  });
})(window);


// 1. Listen for lt to close (does this cover forced closes?
//    If not, Perhaps listen for fopen/close).
//    Use DOM events. No idea how to add a listener not associated w/ a behavior
//    And trying to reverse engineer behaviors sounds fairly heavyweight.
// 2. Record opened files as a list within each tabgroup. tabs[groupIdx][fileIdx]
// 3. On lt open, if behavior is included, restore last workspace.
