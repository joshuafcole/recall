(function nodePluginBootstrap(window) {
  var lt = window.lt;
  var path = require('path');

  var root = lt.objs.plugins.adjust_path(''); console.log('ROOT', root);
  if(!root) {
    throw new Error("plugin could not be found by LT:", root);
  }

  var ltrap = require(path.join(root, 'node_modules', 'ltrap'))({
    root: root,
    nwRequire: require,
    window: window,
  });

  var pkg = ltrap.require('package');

  if(!lt.js_plugins) {
    lt.js_plugins = {};
  }

  // Initiate new plugin instance.
  var plugin = ltrap.require(path.join('lib', pkg.name));
  lt.js_plugins[pkg.name] = plugin;
})(window);
