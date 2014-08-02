var lolipop = require('../../lolipop/lolipop');
var config = require('../config.json');
var lp = lolipop(config);

rowStream = lp.createRowStream(null, process.argv[2]);
rowStream.on('error', function (err) {
  console.log('Error');
})
.on('result', function (row) {
  console.log(row);
});

lp.end();
