#! /usr/bin/env node
var program = require('commander')
  , kaizoku = require('./lib/kaizoku.js')
  , Table = require('cli-table')
  , exec = require('child_process').exec
  , open = require("open")
  ;

// Get version from package.json.
var version = require('./package.json').version;
program.version(version)

/**
 * Search command.
 * Example: kaizoku search [keywords].
 */
program
  .command('search [keywords]')
  .alias('s')
  .option("-c, --category <category>", 'The category to search in.')
  .description('Use this command to search torrents.')
  .action(function(keywords, options){
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.setURL(program.url);
    kaizoku.search(keywords, options.category, function(torrents) {
      // Log output to terminal.
      kaizoku.displayTorrents(torrents);
      var readline = require('readline');
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      rl.on('line', function(line){
          open(torrents[parseInt(line)].magnet);
          process.exit(0);
      })
    });
  });

/**
 * Download command.
 * Example: kaizoku download [keywords].
 */
program
  .command('download [keywords]')
  .alias('d')
  .option("-c, --category <category>", 'The category to search in.')
  .description('Use this command to quickly download a torrent.')
  .action(function(keywords, options){
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.setURL(program.url);
    kaizoku.search(keywords, options.category, function(torrents) {
      // Get the magnet link for the first result.
      // Assumming the first result has the most seeds.
      var magnentLink = torrents[0].magnet;

      // Display the top torrent.
      console.log("Found: ");
      console.log(torrents[0].title);

      // Display the magnet link.
      console.log("");
      console.log("Magnet link for top torrent:");
      console.log(magnentLink);

      // Open the magnent link.
      // exec("open " + magnentLink);
      open(magnentLink);
    });
  });

/**
 * Top command.
 * Example: kaizoku top [category].
 */
program
  .command('top [category]')
  .alias('t')
  .description('Use this command to see top torrents.')
  .action(function(category, options){
    if (!category) {
      console.log('Error: category missing. Use kaizoku cat to see a list of available categories.');
      program.help();
    }
    kaizoku.setURL(program.url);
    kaizoku.top(category, function(torrents) {
      // Log output to terminal.
      kaizoku.displayTorrents(torrents);
    });
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

/**
 * URL option.
 * Change the url used to access the pirate bay
 */
program
  .option('-u, --url <url>', 'set a different URL to access the pirate bay.')

program.parse(process.argv);

if (!program.args.length) program.help();
