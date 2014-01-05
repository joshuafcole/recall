var _ = require('underscore');
var $ = require('jquery');
var path = require('path');

module.exports = function(window) {
  /*\
  |*| Requires plugin-local files and modules.
  \*/
  function requireLocal(name, root) {
    var ltdir = window.lt.util.load.pwd;
    root = root || path.join(ltdir, 'plugins', 'recall');
    var module;
    try {
      module = require(path.join(root, name));
    } catch (e) {
      if(e.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }

    if(!module) {
      module = require(path.join(root, 'node_modules', name));
    }

    if(!module) {
      module = require(name);
    }

    return module;
  }

  var cljs = window.cljs;
  var lt = window.lt;

  /*\
  |*| Registers functions as CodeMirror actions.
  |*| Currently used as a hack becasue CodeMirror actions are the only
  |*| Functions I know how to create and trigger in keymaps.
  \*/
  function addAction(commandName, command) {
    var CodeMirror = window.CodeMirror;

    if (!CodeMirror.commands[commandName]) {
      CodeMirror.commands[commandName] = command;
    }
  }

  /*\
  |*| Casts a string into a cljs keyword.
  \*/
  function toKeyword(name) {
    return new cljs.core.Keyword(null, name, name);
  }

  /*\
  |*| Tells Light Table to listen to and dispatch key events for the given context.
  \*/
  function enterContext(context) {
    var keyword = toKeyword(context);
    lt.objs.context.in_BANG_.call(null, keyword, null);
  }

  /*\
  |*| Tells Light Table to cease listening to and dispatching key events for the given context.
  \*/
  function exitContext(context) {
    var keyword = toKeyword(context);
    lt.objs.context.out_BANG_.call(null, keyword, null);
  }

  function command(name) {
    var args = [].slice.call(arguments, 1);
    var kw = toKeyword(name);
    args.unshift(kw);
    return lt.objs.command.exec_BANG_.apply(lt.objs.command.command, args);
  }

  /*************************************************************************\
   * File Helpers
  \*************************************************************************/
  /*\
  |*| Gets the filepath of the currently active tab, super hacky.
  \*/
  function getActiveFile() {
    var $activeTab = $('#multi .tabset > .list li.active');
    return $activeTab.attr('title');
  }

  /*\
  |*| @TODO: Implement me.
  |*| Gets a list of all open tabs, represented in a 2D array of [group][file]
  \*/
  function getTabs() {
    var tabsets = $('#multi .tabset');
    return _.map(tabsets, function(tabset) {
      return _.map($(tabset).find('.list li'), function(tab) {
        return $(tab).attr('title');
      });
    });
  }

  /*\
  |*| Opens a file in the current tabset.
  \*/
  function open(filepath) {
    command('open-path', filepath);
  }

  /*************************************************************************\
   * Tab Helpers
  \*************************************************************************/
  /*\
  |*| Gets the directory containing the current buffer if one exists, or home.
  |*| cwd in LT points to LT's directory
  |*| @TODO: Rename to getActiveDirectory
  \*/
  function getBufferDirectory() {
    var dir = path.dirname(getActiveFile());
    if(dir === '.') {
      dir = '~';
    }
    dir += path.sep;
    return dir;
  }

  /*************************************************************************\
   * UI Helpers
  \*************************************************************************/
  /*\
  |*| Opens a nifty synchronous prompt provided by lt.
  \*/
  function prompt(message) {
    return window.prompt(message);
  }

  /*\
  |*| Toggles an element's visiblity. Returns truthy if
  |*| opened and falsy if closed.
  \*/
  function showContainer(container) {
    var $container = $(container);
    var height = $container.height();
    if(height === 0) {
      $container.height('auto');
    } else {
      $container.height(0);
    }

    return !height;
  }

  /*\
  |*| Adds an element to a container's .content div.
  \*/
  function addItem(container, item) {
    $(container).children('.content').first().append(item);
  }

  return {
    requireLocal: requireLocal,
    addAction: addAction,
    toKeyword: toKeyword,
    enterContext: enterContext,
    exitContext: exitContext,
    command: command,

    getActiveFile: getActiveFile,
    getTabs: getTabs,
    getBufferDirectory: getBufferDirectory,
    open: open,

    prompt: prompt,
    showContainer: showContainer,
    addItem: addItem
  };
};
