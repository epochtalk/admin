var fs = require('fs');
var archiver = require('archiver');
var zlib = require('zlib');
var tar = require('tar');
var request = require('request');
var path = require('path');

function backup(dbPath) {
  if (!fs.existsSync(dbPath)) {
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

function restore(tarballPath) { // TODO
  var tarball, dest;
  if (fs.existsSync(tarballPath)) { // zipPath is a path
    tarball = fs.createReadStream(tarballPath);
    dest = tarballPath.replace('.tar.gz', '');
  }
  else if (tarballPath.indexOf('http') > -1 && tarballPath.indexOf('.tar.gz') > -1) { // zipPath is a url
    var downloadedBytes = 0;
    var filename = tarballPath.split('/');
    filename = filename[filename.length-1];
    tarball = request(tarballPath)
    .on('data', function(bytes) {
      downloadedBytes += bytes.length;
      var fileSize = this.response.headers['content-length'];
      var percentage = Number(downloadedBytes/fileSize * 100).toFixed(2);
      process.stdout.write('Downloading ' + percentage + '%\r');
    });
    dest = path.join('.', filename.replace('.tar.gz', ''));
  }
  else {
    return console.log('Path or URL does not exist.');
  }
  tarball.on('error', console.log)
  .pipe(zlib.Unzip())
  .pipe(tar.Extract({ path: dest }))
  .on('end', function(err) {
    if (err) {
      console.log(err);
    }
    console.log('Restored: ' + dest + ' from: ' + tarballPath);
  });
}

module.exports = {
  backup: backup,
  restore: restore
};
