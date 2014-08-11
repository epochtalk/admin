var smfImporter = require('importer-smf');
module.exports = {
  run: function(args, cb) {
         console.log('SMF Importer with args: ' + JSON.stringify(args));
         smfImporter(args.debug, cb);
       }
}
