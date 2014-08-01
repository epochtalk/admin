var path = require('path');
var fs = require('fs');
var replify = require('replify');
// var core = require(path.join(__dirname, '../core'));

var usage = fs.readFileSync(path.join(__dirname, '/usage'), 'utf-8');
var program = require('commander');
program
  .version('0.0.1')
  .option('-q, --query', 'Query')
  .option('-i, --import [importer]', 'Import from...')
  .parse(process.argv);

var query = require(path.join(__dirname, 'query')); 
var imp = require(path.join(__dirname, 'import'));

if (program.query) query(program.query);
else if (program.import) imp(program.import);
else {
  program.help();
}

