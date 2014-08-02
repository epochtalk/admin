var lolipop = require('../../lolipop/lolipop');
var config = require('../config.json');
lp = lolipop(config);

lp.getColumns(null, process.argv[2], function (err, columns) {
  if (err) {
    console.log(err);
  }
  columns.forEach(function (column) {
    console.log(column.Field);
  });
});
lp.end();
