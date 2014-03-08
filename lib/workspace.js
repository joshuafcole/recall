var _ = require('underscore');
var fs = require('fs');
var indeks = require('indeks');
var ltrap = require('ltrap');
var path = require('path');
var ignore = ltrap.ignore;

var migrate = require('./migrate');


var workspaceDir = path.join(__dirname, '..', 'workspaces');
var workspace = {};

workspace.list = function list() {
  try {
    return indeks.index(workspaceDir, {ext: '.json', ignore: null, loader: _.identity});
  } catch(err) {
    if(err.code === 'ENOENT') {
      return {};
    }
  }
};

workspace.save = function save(name, ws) {
  var wsPath = path.join(workspaceDir, name + '.json');
  if(!wsPath) {
    return false;
  }

  // If the directory exists we're good.
  ignore(_.partial(fs.mkdirSync, path.dirname(wsPath)), 'EEXIST');
  // If the file doesn't already exist we're good.
  ignore(_.partial(fs.unlinkSync, wsPath), 'ENOENT');
  fs.writeFileSync(wsPath, JSON.stringify(ws, null, 2));
};

workspace.load = function load(name, callback) {
  var wsPath = workspace.list()[name];
  if(!wsPath) {
    return false;
  }

  fs.readFile(wsPath, function(err, data) {
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
