var _u = require('underscore');

module.exports = {
  createPath: createPath,
  copyDisc: copyDisc,
  parseDiscNumber: parseDiscNumber
}

function createPath() {
    var path = '';
    _u.forEach(arguments, function(arg) {
        arg = arg.replace(/\/$/, '');
        path = path + '/' + arg;
    })
    return path.replace(/^\//, '');;
}

function copyDisc(disc) {
    return {
        name: disc.name,
        path: disc.path,
        files: disc.files.slice()
    }
}

function parseDiscNumber(discName) {
  if (!discName) {
    throw new Error('Disc name "' + discName + '" is not valid')
  }
  var m = discName.match(/\d\d$/);
  return m ? parseInt(m[0]) : undefined;
}
