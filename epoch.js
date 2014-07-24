#!/usr/bin/env node

var fs = require('fs');
var usage = fs.readFileSync(__dirname + '/usage', 'utf-8');
var yargs = require('yargs')
  .options('i', {alias : 'import'})
  .usage(usage);
var argv = yargs.argv;

if (argv.recreate) {
  console.log('argv.recreate');
}
else if (argv.create) {
  console.log('argv.create');
}
else if (argv.update) {
  console.log('argv.create');
}
else if (argv.seed) {
  console.log('argv.seed');
}

else if (argv.i) {
  console.log('importer: ' + argv.i);
}
else {
  console.log(yargs.help());
}

