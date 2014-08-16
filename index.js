var path = require('path');
var fs = require('fs');
var replify = require('replify');

var usage = fs.readFileSync(path.join(__dirname, '/usage'), 'utf-8');
var program = require('commander');
program
  .version('0.0.1')
  .option('-q, --query', 'Query')
  .option('-d, --debug', 'Include debug messages')
  .option('-m, --migrate <type>', 'Migrate from database of <type>')
  .option('--leveldb <path>', 'Path to leveldb (default: ./epoch.db)')
  .parse(process.argv);

var query = require(path.join(__dirname, 'query'));
var imp = require(path.join(__dirname, 'import'));

if (program.query) query(program.query);
else if (program.migrate) imp(program.migrate, {
  debug: program.debug,
  leveldbPath: program.leveldb || path.join(__dirname, 'epoch.db')
});
else {
  program.help();
}

