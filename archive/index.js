var fs = require('fs');
var archiver = require('archiver');
var zipArchive = archiver('zip');

function backup(path) {
  var outputPath = path + '.zip';
  var output = fs.createWriteStream(outputPath);
  zipArchive.pipe(output);

  zipArchive.bulk([
      { src: [ '**/*' ], cwd: path, expand: true }
  ]);

  zipArchive.finalize();

  output.on('close', function() {
      console.log('Database backed up to: ', outputPath);
  });
}

function restore(path) { // TODO
  console.log('Unzip: ' + path);
}

module.exports = {
  backup: backup,
  restore: restore
};
