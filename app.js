#! /usr/bin/env node
var program = require('commander');
var kaizoku = require('./lib/kaizoku.js');

// Get version from package.json.
var version = require('./package.json').version;
program.version(version)

/**
 * Search command.
 * Example: kaizoku search [keywords].
 */
program
  .command('search [keywords]')
  .description('Use this command to search torrents.')
  .action(function(keywords, options){
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.search(keywords);
  });

/**
 * Download command.
 * Example: kaizoku download [keywords].
 */
program
  .command('download [keywords]')
  .description('Use this command to quickly download a torrent.')
  .action(function(keywords, options){
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.download(keywords);
  });

program.parse(process.argv);

if (!program.args.length) program.help();