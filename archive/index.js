var fs = require('fs');
var archiver = require('archiver');
var zlib = require('zlib');
var tar = require('tar');
var request = require('request');
var path = require('path');
var ProgressBar = require('progress');

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

function restore(tarballPath) {
  var tarball, filename;
  var regexUrl = new RegExp('^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?(\.tar\.gz)$');

  if (fs.existsSync(tarballPath)) {
    tarball = fs.createReadStream(tarballPath);
    filename = path.basename(tarballPath);
  }
  else if (regexUrl.test(tarballPath)) { // zipPath is a url
    tarball = request(tarballPath);
    var progressBar;

    tarball.on('response', function(res) {
      if (res.statusCode === 200) {
        progressBar = new ProgressBar('Downloading [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: parseInt(res.headers['content-length'], 10)
        });
      }
      else {
        console.log(res.statusCode + ' ERROR: ' + tarballPath + ' is an invalid URL.');
        return process.exit(1);
      }
    });

    tarball.on('data', function(bytes) {
      progressBar.tick(bytes.length);
    });

    filename = tarballPath.split('/');
    filename = filename[filename.length-1];
  }
  else {
    return console.log('Invalid Path/URL');
  }

  var dest = path.join('.', filename.replace('.tar.gz', ''));
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
