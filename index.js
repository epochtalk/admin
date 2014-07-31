var path = require('path');
var fs = require('fs');
var replify = require('replify');
var core = require(path.join(__dirname, '../core'));

var usage = fs.readFileSync(path.join(__dirname, '/usage'), 'utf-8');
var program = require('commander');
program
  .version('0.0.1')
  .option('-q, --query', 'Query')
  .option('-i, --import', 'Import from...')
  .parse(process.argv);

program.on('--help', function(){
  console.log(usage);
});

var query = require(path.join(__dirname, 'query')); 
var imp = require(path.join(__dirname, 'import'));

if (program.q) query(argv.q);
else if (program.i) imp(argv.i);
else {
}

