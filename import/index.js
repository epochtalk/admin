var path = require('path');
module.exports = function(importer, args) {
  var importer = require(path.join(__dirname, importer));
  importer.run(args, function(err) {
    console.log('done');
  });
}
