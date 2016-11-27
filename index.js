#!/usr/bin/env node

"use strict";

var fs = require('fs');
var _u = require('underscore');
var program = require('commander');
var microlink = require('./microlink');

var config = microlink.config;
var stats = microlink.stats;
var helpers = microlink.helpers

program
  .version('0.0.1')
  .usage('[options] <files ...>');

program
  .command('init [path]')
  .description('Create Microlink file structure on selected path')
  .option('-n, --discs <n>', 'Number of discs to create', parseInt)
  .action(function(path, options) {
    path = path || config.DEFAULT_PATH;
    var discCount = 0;
    var i;

    if (!options.discs || options.discs >= config.DISC_NAMES.length) {
      options.discs = config.DISC_NAMES.length;
    }

    for (i = 0; i < options.discs; i++) {
      var discPath = helpers.createPath(path, config.DISC_NAMES[i]);

      if (!fs.existsSync(discPath)) {
        fs.mkdirSync(discPath);
        discCount++;
      }
    }

    if (discCount) {
      console.log(discCount + " Micrlink drives created");
    } else {
      console.log("Microlink file structure already exist");
    }
  });

program
  .command('info [path]')
  .description('Show information about Microlink drive')
  .action(function(path, options) {
    path = path || config.DEFAULT_PATH;
    var discs = microlink.scanPath(path);

    if (!discs.length) {
      console.log("This is not Microlink drive. Type 'init [path]' to initialize Microlink drive. \n");
      return;
    }

    console.log("Microlink drive detected. \n");
    console.log("   Discs: \t" + discs.length);
    // console.log("   Duration: \t" + 1543 + " minutes\n");

    _u.forEach(discs, function(disc) {
      console.log('== ' + disc.name + ' ====\n');
      console.log('   Songs: \t' + stats.countFiles(disc));
      console.log('   Invisible: \t' + stats.countInvisibleFiles(disc));
      // console.log('   Duration: \t' + 60 + ' minutes\n');
    });
  });

program
  .command('shuffle [path]')
  .description('Shuffle supported music files in Microlink folders')
  .option('-r, --revert', 'Revert shuffled files to original')
  .option('-d, --disc <n>', 'Number of the disc which will be shuffled', parseInt)
  .action(function(path, options) {
    path = path || config.DEFAULT_PATH;

    var discs = microlink.scanPath(path);

    discs = _u.map(discs, function(disc) {
      disc.original = helpers.copyDisc(disc);

      if (options.disc && disc.number !== options.disc) {
        return disc;
      }

      if (options.revert) {
        return microlink.unshuffleDisc(disc);
      } else {
        return microlink.shuffleDisc(disc);
      }
    });

    _u.forEach(discs, function(disc) {
      microlink.renameFiles(disc);
    });

    console.log('Music files are ' + (options.revert ? "unshuffled" : "shuffled") + ' in ' +
        (options.disc ? "Disc " + options.disc : "all discs") + '.')
      // console.log(discs);
  });

program
  .command('balance [path]')
  .description('Balance files in folders so all can be accessable')
  .action(function(path, options) {
    console.log('This option is not implemented')
  });

program
  .command('collection [path]')
  .description('Balance files in folders so all can be accessable')
  .action(function(path, options) {
    console.log('This option is not implemented')
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
