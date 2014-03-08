var fs = require('fs');
var path = require('path');

var indeks = module.exports = {};

function isArray(val) {
  return (typeof val === 'object') && val.length;
}

/**
 * Given a filename in the standard lower_snake_cased.ext format,
 * return a mangled name in lowerCamelCase.
 */
indeks.getVarName = function(file) {
  if(typeof file !== 'string') {
    return false;
  }

  // Chops off extension(s).
  file = file.split('.')[0];
  // Splits name into words.
  var words = file.split(/[_-]/);

  var name = words[0];

  // Upper camel cases remaining words.
  for(var i = 1, len = words.length; i < len; i++) {
    name += words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  return name;
};

/**
 * Given a directory, import all files within it.
 * opts: {
 * ext?:String|Array = '.js'
 * ignore?:String|Array, = 'index.js'
 * loader?:Function = require
 * }
 */
indeks.index = function(dir, opts) {
  if(!opts) {
    opts = {};
  }
  opts.ext = opts.ext || '.js';
  if(!isArray(opts.ext)) {
    opts.ext = [opts.ext];
  }
  opts.ignore = (opts.ignore !== undefined) ? opts.ignore : 'index.js';
  if(!opts.ignore) {
      opts.ignore = [];
  }
  if(!isArray(opts.ignore)) {
    opts.ignore = [opts.ignore];
  }
  opts.loader = opts.loader || indeks.load;

  var imports = {};

  fs.readdirSync(dir).forEach(function(file) {
    // Bail if file is not of a whitelisted extension.
    var validExt = opts.ext.reduce(function(memo, ext) {
      if(file.indexOf(ext, file.length - ext.length) !== -1) {
        return true;
      }
      return memo;
    }, false);
    if(!validExt) {
      return;
    }

    // Bail if file is blacklisted.
    var ignored = opts.ignore.reduce(function(memo, ignore) {
      if(file === ignore) {
        return true;
      }
      return memo;
    }, false);
    if(ignored) {
      return;
    }

    var name = indeks.getVarName(file);
    imports[name] = opts.loader(path.join(dir, file));
  });

  return imports;
};
