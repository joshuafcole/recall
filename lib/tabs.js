var ltrap = require('ltrap');

var lt = ltrap.params.window.lt;
var cljs = ltrap.params.window.cljs;

// CLJS shortcuts
  var deref = cljs.core.deref;
  var get = cljs.core.get;
  var keyword = cljs.core.keyword;

  /**
   * Gets an array of atoms representing currently open tabsets.
   */
  function getTabsets() {
    var multi = deref(lt.objs.tabs.multi);
    var tabsets = get(multi, keyword('tabsets'));

    var tabsetList = [];
    for(var i = 0; i < cljs.core.count(tabsets); i++) {
      var tabset = get(tabsets, i);
      tabsetList.push(tabset);
    }

    return tabsetList;
  }

  /**
   * Gets an array of atoms representing the tabs in the given tabset.
   */
  function getTabs(tabset) {
    tabset = deref(tabset);
    var tabs = get(tabset, keyword('objs'));

    var tabList = [];
    for(var i = 0; i < cljs.core.count(tabs); i++) {
      var tab = get(tabs, i);
      tabList.push(tab);
    }

    return tabList;
  }

  /**
   * Gets the absolute path to a given object if it is file backed.
   */
  function getPath(obj) {
    return lt.objs.tabs.__GT_path(obj);
  }

  /**
   * Gets the active tab in the given tabset, or the current tabset if not provided.
   */
  function getActiveTab(tabset) {
    if(!tabset) {
      return lt.objs.tabs.active_tab();
    }

    return get(deref(tabset), keyword('active-obj'));
  }

module.exports = {
  getTabsets: getTabsets,
  getTabs: getTabs,
  getPath: getPath,
  getActiveTab: getActiveTab
};
