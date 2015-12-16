var reactTools = require('react-tools');

module.exports = {
  process: function(src, path) {
    if (path.match(/\.js$/)) {
      return reactTools.transform(src, { harmony: true });
    }
    return src;
  }
};
