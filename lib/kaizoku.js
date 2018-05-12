/**
 * @file
 * Kaizoku lib.
 */
var request = require('request')
  , cheerio = require('cheerio')
  , Table = require('cli-table')
  , qs = require('querystring')
  , categories = require('./categories')
  ;

// URL
exports.url = 'https://thepiratebay.org';

/**
 * Search for torrents using the provided keywords.
 */
exports.search = function(keywords, category, callback) {
  var params = keywords;

  // Look up the category id of it is set.
  if (category) {
    var categoryID = categories[category];
    if (categoryID) {
      params += '/0/7/' + categoryID;
    }
  }

  var searchURL = exports.buildQueryString('search', params);
  request(searchURL, function (error, response, body) {
    if (error) throw error;

    if (!error && response.statusCode == 200) {
      var torrents = exports.extractTorrents(body);
      if (callback) {
        callback(torrents);
      }
    }
  })
}

/**
 * List all top 24h torrents for a category.
 */
exports.top = function(category, callback) {
  var categoryID = categories[category];
  if (categoryID) {
    var topURL = exports.buildQueryString('top', categoryID);
    request(topURL, function (error, response, body) {
      if (error) throw error;

      if (!error && response.statusCode == 200) {
        var torrents = exports.extractTorrents(body);
        callback(torrents);
      }
    });
  }
  else {
    console.log("Error: could not find category: " + category);
  }
}

/**
 * Helper to build a query string.
 */
exports.buildQueryString = function(path, params) {
  return exports.url += '/' + path + '/' + qs.escape(params);
}

let id = 0;
/**
 * Extracts torrents from string using cheerio.
 */
exports.extractTorrents = function(string) {
  var torrents = [];
  $ = cheerio.load(string);

  $("table#searchResult").find('tr').each(function() {
    if (!$(this).hasClass('header')) {
      // Parse string for data.
      var torrent = {};
      torrent.title = $(this).find('td').eq(1).find('a').text().substr(0,40);
      torrent.magnet = $(this).find('td').eq(1).find('.detName').next('a').attr('href');
      torrent.desc = $(this).find('td').eq(1).find('.detDesc').text().replace(/.*Size /, "").replace(/,.*/, "");
      torrent.seeders = $(this).find('td').eq(2).text();
      torrent.leechers = $(this).find('td').eq(3).text();
      torrent.category = $(this).find('td').eq(0).find('a').eq(0).text();
      torrent.subcategory = $(this).find('td').eq(0).find('a').eq(1).text();
      torrent.id = id;
      id += 1;
      torrents.push(torrent);
    }
  });;

  return torrents;
}

/**
 * Logs torrents to the console in tabuler format.
 */
exports.displayTorrents = function(torrents) {
  var table = new Table({
    head: ['Id', 'Category', 'Title', 'Seeders', 'Size']
  });

  for (var i in torrents) {
    var torrent = torrents[i];
    table.push(
      [torrent.id, torrent.subcategory, torrent.title, torrent.seeders, torrent.desc]
    );
  }

  console.log(table.toString());
}

/**
 * Returns all categories defined in ./categories.
 */
exports.getCategories = function() {
  return categories;
}

/**
 * Set the pirate bay URL. Resets to default if the argument is null
 */
exports.setURL = function(newUrl) {
  if(newUrl) exports.url = newUrl; else exports.url = 'https://thepiratebay.org'
}
