#! /usr/bin/env node
var program = require('commander');
var subdb = require('./lib/kaizoku.js');

// Get version from package.json.
var version = require('./package.json').version;

program
  .version(version)