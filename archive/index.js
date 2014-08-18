var fs = require('fs');
var archiver = require('archiver');
var request = require('request');
var zlib = require('zlib');
var path = require('path');

function backup(dbPath) {
  if (!path.existsSync(dbPath)) {
    return console.log('Path does not exist.');
  }
  var zipArchive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 1
    }
  });
  var outputPath = dbPath + '.tar.gz';
  var output = fs.createWriteStream(outputPath);
  zipArchive.pipe(output);

  zipArchive.bulk([
    { src: [ '**/*' ], cwd: dbPath, expand: true }
  ]);

  zipArchive.finalize();

  output.on('close', function() {
    console.log('Database backed up to: ', outputPath);
  });
}

function restore(zipPath) { // TODO
  if (path.existsSync(zipPath)) { // zipPath is a path
    
  }
  else if (zipPath.indexOf('http') > -1) { // zipPath is a url
    var zipUrl = zipPath;

  }
  else {
    console.log('Path or URL does not exist.');
  }
  console.log('Restored: ' + zipPath);
}

module.exports = {
  backup: backup,
  restore: restore
};
