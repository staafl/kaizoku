#! /usr/bin/env node
var program = require('commander')
  , kaizoku = require('./lib/kaizoku.js')
  , Table = require('cli-table')
  , open = require("open")
  , peerflix = require('peerflix')
  , readlineSync = require('readline-sync')
  // , magnetToTorrent = require('magnet-to-torrent')
  // , createTorrent = require('create-torrent')
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
  .option("-sc, --categories", 'Displays the category for each torrent.')
  .option("-d, --details", 'Displays more details about each torrent.')
  .option("-p, --pipe", 'Pipes output magnet.')
  .option("-t, --transmission", 'Uses transmission-daemon to download torrent with magnet (brew install transmission).')
  .description('Use this command to search torrents.')
  .action(function(keywords, options){
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.setURL(program.url);
    kaizoku.search(keywords, options.category, function(torrents) {
      // Log output to terminal.
      kaizoku.displayTorrents(torrents, options.categories, options.details);

      var torrentId = readlineSync.question('\x1b[32m Select a torrent Id to start download: ');

      if (torrentId) {
        var magnentLink = torrents[torrentId].magnet;
        // Open the magnent link.
        if (options.transmission) {
          const exec = require('child_process').exec;
          const execSync = require('child_process').execSync;
          var cmd = execSync('transmission-daemon'); // // make sure the transmission daemon is running (requirement on MacOS: $ brew install transmission)
          exec('transmission-remote -a ' + magnentLink, (error, stdout, stderr) => { // add selected torrent via magnet
              if (error !== null) console.log('\x1b[41m', 'exec error: ' + error, '\x1b[0m');
            else {
              exec('transmission-remote -l', (error, stdout, stderr) => { // list transmisstion torrents
                console.log('\x1b[36m', stdout, '\x1b[0m');
                if (error !== null) console.log('\x1b[41m', 'exec error: ' + error, '\x1b[0m');
              });
            }
          });
        }
        else if (options.pipe) {
          console.log(magnentLink);
        }
        else open(magnentLink);
      }
      else {
        console.log('No torrent selected for download.');
      }
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
  .option("-i, --id <id>", 'The ID of a torrent to download.', parseInt)
  .description('Use this command to quickly download a torrent.')
  .action(function(keywords, options){
    var torrentId = null;

    // Only check if there are keywords to search if there is no ID
    if (!options.id) {
      if (!keywords) {
        console.log('Error: keywords missing');
        program.help();
      }
    } else {
      torrentId = options.id;
    }

    kaizoku.setURL(program.url);

    if (torrentId) {
      kaizoku.magnet(torrentId, function(torrent) {
        // Get the magnet link for the first result.
        // Assumming the first result has the most seeds.
        var magnetLink = torrent.magnet;

        // Display the top torrent.
        console.log("Found: ");
        console.log(torrent.title);

        // Display the magnet link.
        console.log("");
        console.log("Magnet link for torrent:");
        console.log(magnetLink);

        // Open the magnent link.
        open(magnetLink);
      });
    } else {
      kaizoku.search(keywords, options.category, function(torrents) {
        // Get the magnet link for the first result.
        // Assumming the first result has the most seeds.
        var magnetLink = torrents[0].magnet;

        // Display the top torrent.
        console.log("Found: ");
        console.log(torrents[0].title);

        // Display the magnet link.
        console.log("");
        console.log("Magnet link for top torrent:");
        console.log(magnetLink);

        // Open the magnent link.
        open(magnetLink);
      });
    }
  });

/**
 * Stream command.
 * Example: kaizoku stream [keywords].
 */
program
  .command('stream [keywords]')
  .alias('st')
  .option("-c, --category <category>", 'The category to search in.')
  .option("-l, --subtitle <sid>", 'Sid From Legendas-zone.')
  .description('Use this command to quickly stream a torrent.')
  .action(function (keywords, options) {
    if (!keywords) {
      console.log('Error: keywords missing');
      program.help();
    }

    kaizoku.setURL(program.url);

    kaizoku.search(keywords, options.category, function (torrents) {

      if(torrents.length == 0){
        console.log("Torrents not found");
        return;
      }
      // Display the top torrent.
      console.log("Watching: "+torrents[0].title);

      // Get the magnet link for the first result.
      // Assumming the first result has the most seeds.
      var magnetLink = torrents[0].magnet;

      var engine = peerflix(magnetLink);

      engine.server.on('listening', function () {
        var myLink = 'http://localhost:' + engine.server.address().port + '/';
        //Play to VLC and "network" :D
        kaizoku.playVlc(myLink, engine);
      });
    });
  });

/**
 * Top command.
 * Example: kaizoku top [category].
 */
program
  .command('top [category]')
  .alias('t')
  .option("-sc, --categories", 'Displays the category for each torrent.')
  .option("-d, --details", 'Displays more details about each torrent.')
  .option("-p, --pipe", 'Pipes output magnet.')
  .option("-t, --transmission", 'Uses transmission-daemon to download torrent with magnet (brew install transmission).')
  .description('Use this command to see top torrents.')
  .action(function(category, options){
    if (!category) {
      console.log('Error: category missing. Use kaizoku cat to see a list of available categories.');
      program.help();
    }
    kaizoku.setURL(program.url);
    kaizoku.top(category, function(torrents) {
      // Log output to terminal.
      // shouldn't really display categories here as, we are selecting a specific category to show
      kaizoku.displayTorrents(torrents, false, options.details);

      var torrentId = readlineSync.question('\x1b[32m Select a torrent Id to start download: ');

      if (torrentId) {
        var magnentLink = torrents[torrentId].magnet;
        // Open the magnent link.
        if (options.transmission) {
          const exec = require('child_process').exec;
          const execSync = require('child_process').execSync;
          var cmd = execSync('transmission-daemon'); // // make sure the transmission daemon is running (requirement on MacOS: $ brew install transmission)
          exec('transmission-remote -a ' + magnentLink, (error, stdout, stderr) => { // add selected torrent via magnet
              if (error !== null) console.log('\x1b[41m', 'exec error: ' + error, '\x1b[0m');
            else {
              exec('transmission-remote -l', (error, stdout, stderr) => { // list transmisstion torrents
                console.log('\x1b[36m', stdout, '\x1b[0m');
                if (error !== null) console.log('\x1b[41m', 'exec error: ' + error, '\x1b[0m');
              });
            }
          });
        }
        else if (options.pipe) {
          console.log(magnentLink);
        }
        else open(magnentLink);
      }
      else {
        console.log('No torrent selected for download.');
      }
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
