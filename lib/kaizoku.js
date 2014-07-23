/**
 * @file
 * Kaizoku lib.
 */
var request = require('request')
, cheerio = require('cheerio')
, qs = require('querystring')
, exec = require('child_process').exec
, url = 'http://thepiratebay.se'
;

exports.search = function(keywords, callback) {
  var searchURL = exports.buildQueryString('search', keywords);
  request(searchURL, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    if (!error && response.statusCode == 200) {
      var torrents = exports.extractTorrents(body);
      if (callback) {
        callback(torrents);
      }
      else {
        console.log(torrents)
      }
    }
  })
}

exports.download = function(keywords) {
  exports.search(keywords, function(torrents) {
    if (torrents.length) {
      var magentLink = torrents[0].magnet;
      exec("open " + magentLink);
    }
  });
}

exports.buildQueryString = function(path, params) {
  return url += '/' + path + '/' + qs.escape(params);
}

exports.extractTorrents = function(string) {
  var torrents = [];
  $ = cheerio.load(string);

  $("table#searchResult").find('tr').each(function() {
    if (!$(this).hasClass('header')) {
      // Parse string for data.
      var torrent = {};
      torrent.title = $(this).find('td').eq(1).find('a').text();
      torrent.magnet = $(this).find('td').eq(1).find('.detName').next('a').attr('href');
      torrent.seeders = $(this).find('td').eq(2).text();
      torrent.leechers = $(this).find('td').eq(3).text();
      torrent.category = $(this).find('td').eq(0).find('a').eq(0).text();
      torrent.subcategory = $(this).find('td').eq(0).find('a').eq(1).text();
      torrents.push(torrent);
    }
  });;

  return torrents;
}
