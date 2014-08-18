var path = require('path');
var program = require('commander');
program
  .version('0.0.1')
  .option('-q, --query', 'Query')
  .option('-b, --backup <path>', 'Backup database at <path>')
  .option('-r, --restore <path/url>', 'Restore database from backup at <path/url>')
  .option('--seed', 'Seed database with test data (Developer)')
  .option('--debug', 'Include debug messages')
  .option('--verbose [verbosity]', 'Specify verbosity')
  .option('-m, --migrate <type>', 'Migrate from database of <type>')
  .option('--leveldb <path>', 'Path to leveldb (default: ./epoch.db)')
  .parse(process.argv);
var epochdb = 'epoch.db';
var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
  db: program.leveldb || path.join(__dirname, epochdb)
}

var query = require(path.join(__dirname, 'query'));
var imp = require(path.join(__dirname, 'import'));
var archive = require(path.join(__dirname, 'archive'));
var developer = require(path.join(__dirname, 'developer'));

if (program.query) {
  query(program.query);
}
else if (program.migrate) {
  imp(program.migrate, genericArgs);
}
else if (program.backup) {
  archive.backup(program.backup, genericArgs);
}
else if (program.restore) {
  archive.restore(program.restore, genericArgs);
}
else if (program.seed) {
  developer.seed(genericArgs);
}
else {
  program.help();
}

