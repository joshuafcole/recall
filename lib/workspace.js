var _ = require('underscore');
var fs = require('fs');
var indeks = require('indeks');
var ltrap = require('ltrap');
var path = require('path');

var migrate = require('./migrate');

var ignore = ltrap.ignore;

var workspace = {};

workspace.list = function list() {
  return indeks.index(path.join(__dirname, '..', 'workspaces'), {ext: '.json', ignore: null, loader: _.identity});
};

workspace.save = function save(name, ws) {
  var wsPath = workspace.list()[name];
  // If the directory exists we're good.
  ignore(_.partial(fs.mkdirSync, path.dirname(wsPath)), 'EEXIST');
  // If the file doesn't already exist we're good.
  ignore(_.partial(fs.unlinkSync, wsPath), 'ENOENT');
  fs.writeFileSync(wsPath, JSON.stringify(ws, null, 2));
};

workspace.load = function load(name, callback) {
  fs.readFile(workspace.list()[name], function(err, data) {
    if(err) {
      if(err.code === 'ENOENT') {
        return;
      }
      return callback(err);
    }

    // @TODO: Consider if this can be better handled when erroring.
    var ws;
    try {
      ws = JSON.parse(data);
    } catch(e) {
      return callback(e);
    }

    callback(null, migrate(ws));
  });
};

module.exports = workspace;
