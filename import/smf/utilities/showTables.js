var lolipop = require('../../lolipop/lolipop');
var config = require('../config.json');
var lp = lolipop(config);

lp.getTables(null, function (err, tables) {
  if (err) throw err;
  console.log(tables);
});
lp.end();
