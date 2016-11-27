var config = require('./config')

module.exports = {
  countFiles: countFiles,
  countInvisibleFiles: countInvisibleFiles
}

function countFiles(disc) {
  return disc.files.length;
}

function countInvisibleFiles(disc) {
  var invisible = disc.files.length - config.MAX_FILES;
  return invisible <= 0 ? 0 : invisible;
}
