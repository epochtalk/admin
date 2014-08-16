var smfImport = require('smf-import');
module.exports = {
  run: function(args, cb) {
         console.log('SMF Importer with args: ' + JSON.stringify(args));
         smfImport(args, cb);
       }
}
