// 1. Listen for lt to close (does this cover forced closes?
//    If not, Perhaps listen for fopen/close).
// 2. Record opened files as a list within each tabgroup. tabs[groupIdx][fileIdx]
// 3. On lt open, if behavior is included, restore last workspace.

(function recallBootstrap(window) {
  var lt = window.lt;
  var path = require('path');
  var fs = require('fs');

  var util = require(path.join(lt.util.load.pwd, 'plugins', 'claire', 'lib', 'util'))(window);
  var requireLocal = util.requireLocal;

  var _ = requireLocal('underscore');
  var $ = requireLocal('jquery');


  var recall = window.recall || {};
  if(recall.initialized) {
    return recall;
  }

  recall.onClose = function() {
  };

  recall.onStart = function() {
  };

  //@FIXME: Shut up while I'm mocking out structure jshint.
  lt = lt; fs = fs; _ = _; $ = $;
})(window);
