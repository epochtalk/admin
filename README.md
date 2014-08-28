# EpochTalk Admin Tool

Current Options Include:
```sh
Usage: index [options]

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -q, --query               Query
  -b, --backup [path]       Backup database at [path] or default to epoch.db in the current working directory if path is not provided
  -r, --restore <path/url>  Restore database from backup at <path/url>
  --seed                    Seed database with test data (Developer)
  --debug                   Include debug messages
  --verbose [verbosity]     Specify verbosity
  -m, --migrate <type>      Migrate from database of <type>
  --leveldb <path>          Path to leveldb (default: ./epoch.db)
```
## Migrate
The migrate utility connects to an exsiting forum database and converts the data
for import into EpochTalk format.  The mandatory ```<type>``` specifies the type
of database from which to read data.  The ```--debug``` argument can be suppied
to allow command line debugging of the import.
Currently supported types are:
SMF (Simple Machine Forum); implemented in mysql.

## Backup
The backup utility can be used to backup the EpochTalk database into a ```tar.gz``` file. The provided ```[path]``` should be a path to the leveldb directory ```(e.g. ~/some/path/database.db)```, if no path is provided the default is the ```epoch.db``` in the current working directory.

## Restore
The restore utility is used to restore a level database which was backed up using the backup utility. It can restore the database from a local or remote ```tar.gz``` file. The provided ```<path/url>``` must be to a local or url path to a ```tar.gz```  containing the backed up database.

**Warning:** Restore will extract the ```tar.gz``` to a directory of the same name. It will overwrite an existing directory if it happens to share the same name.

## Seed
The seed utility is used to seed a database with mock data. Useful for viewing what the forum will look like with actual users, boards, posts and threads.
