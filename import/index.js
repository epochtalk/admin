var path = require('path');
module.exports = function(importer, debug) {
  var importer = require(path.join(__dirname, importer));
  importer.run({debug: debug}, function(err) {
    console.log('done');
  });
}
