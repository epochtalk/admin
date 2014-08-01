var path = require('path');
module.exports = function(importer) {
  var importer = require(path.join(__dirname, importer));
  importer.run({foo: 'bar'}, function(err) {
    console.log('done');
  });
}
