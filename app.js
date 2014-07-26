#! /usr/bin/env node
var program = require('commander');
var kaizoku = require('./lib/kaizoku.js');
var Table = require('cli-table');

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

/**
 * Top command.
 * Example: kaizoku top [category].
 */
program
  .command('top [category]')
  .description('Use this command to see top torrents.')
  .action(function(category, options){
    if (!category) {
      console.log('Error: category missing. Use kaizoku cat to see a list of available categories.');
      program.help();
    }

    kaizoku.top(category);
  });

/**
 * Categories command.
 * Example: kaizoku cat.
 */
program
  .command('cat')
  .description('Use this command to see all available categories.')
  .action(function(options){
    var categories = kaizoku.getCategories();

    // Log as a table.
    var table = new Table({
      head: ['Category', 'Category ID']
    });

    for (var i in categories) {
      table.push(
        [i, categories[i]]
      );
    }

    console.log(table.toString());
  });

program.parse(process.argv);

if (!program.args.length) program.help();