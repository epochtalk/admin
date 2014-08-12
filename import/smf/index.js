var smfImporter = require('smfImporter');
module.exports = {
  run: function(args, cb) {
         console.log('SMF Importer with args: ' + JSON.stringify(args));
         smfImporter(args.debug, cb);
       }
}
