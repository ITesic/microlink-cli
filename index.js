#!/usr/bin/env node

(function() {
    "use strict";

    var fs = require('fs');
    var _u = require('underscore');
    var program = require('commander');
    var microlink = require('./microlink/index');
    var config = microlink.config;

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
                var discPath = createPath(path, config.DISC_NAMES[i]);

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
            var discs = scanPath(path);

            console.log('\n');

            if (!discs.length) {
              console.log("It is not Microlink drive in. \nType 'init [path]' to initialize Microlink drive.");
              return;
            }

            console.log("Microlink drive detected. " + discs.length + " discs found. \n\n")

            _u.forEach(discs, function(disc){
              console.log('== ' + disc.name + ' ====\n');
              console.log('   Songs: ' + microlink.stats.countFiles(disc) + '\n');
              console.log('   Invisible: ' + microlink.stats.countInvisibleFiles(disc) + '\n');
              // console.log('============================ \n');
            });

            // console.log('Microlink drive info');
        });

    program
        .command('shuffle [path]')
        .description('Shuffle supported music files in Microlink folders')
        .option('-r, --revert', 'Revert shuffled files to original')
        .option('-d, --disc <n>', 'Number of the disc which will be shuffled', parseInt)
        .action(function(path, options) {
            path = path || config.DEFAULT_PATH;
            //TODO Implement Mix only one CD

            var discs = scanPath(path);

            discs = _u.map(discs, function(disc) {
                disc.original = copyDisc(disc);

                if (options.revert) {
                    return unmixDisc(disc);
                } else {
                    return mixDisc(disc);
                }
            });

            _u.forEach(discs, function(disc) {
                renameFiles(disc);
            });

            console.log(discs);
        });

    program
        .command('balance [path]')
        .description('Balance files in folders so all can be accessable')
        .action(function(path, options) {
            console.log('This option is not implemented')
        });

    program.parse(process.argv);

    if (!program.args.length) {
        program.help();
    }

    //=================================================

    function scanPath(path) {
        var fileStructure = [];

        _u.forEach(fs.readdirSync(path), function(dir) {
            if (isValidDisc(dir)) {
                var discPath = createPath(path, dir);
                fileStructure.push({
                    name: dir,
                    path: discPath,
                    files: scanDisc(discPath),
                });
            }
        });

        return fileStructure;
    }

    function scanDisc(discPath, callback) {
        return _u.filter(fs.readdirSync(discPath), function(filename) {
            return isSupportedFormat(filename);
        });
    }

    function saveChanges(discs) {
        _u.forEach(discs, function(disc) {
            if (disc.original) {
                dics = renameFiles(disc);
            }
        });
        return discs;
    }

    function renameFiles(disc) {
        var i;

        if (disc.files.length !== disc.original.files.length) {
            throw new Error("Old files and new files lists are different!");
        }

        for (i = 0; i < disc.files.length; i++) {
            var oldPath = createPath(disc.path, disc.original.files[i]),
                newPath = createPath(disc.path, disc.files[i]);
            fs.renameSync(oldPath, newPath);
        };
    }

    function mixDisc(disc) {
        if (!disc.files.length) {
            return disc;
        }

        var randomizer = _u.range(disc.files.length);
        randomizer = _u.shuffle(randomizer);

        disc.files = _u.map(disc.files, function(file, i) {
            return randomizer[i] + '__' + file;
        });
        return disc;
    }

    function unmixDisc(disc) {
        if (!disc.files.length) {
            return disc;
        }

        var regex = /(\d+__)/g;
        disc.files = _u.map(disc.files, function(file) {
            return file.replace(regex, '');
        });
        return disc;
    }

    function isValidDisc(disc) {
        return _u.contains(config.DISC_NAMES, disc);
    }

    function isSupportedFormat(filename) {
        return _u.contains(config.SUPPORTED_FORMATS, getFileExtension(filename));
    }

    function getFileExtension(filename) {
        return /[^.]+$/.exec(filename)[0];
    }

    //== Helpers

    function createPath() {
        var path = '';
        _u.forEach(arguments, function(arg) {
            arg = arg.replace(/\/$/, '');
            path = path + '/' + arg;
        })
        return path.replace(/^\//, '');;
    }

    function copyDisc(disc) {
        return {
            name: disc.name,
            path: disc.path,
            files: disc.files.slice()
        }
    }
})();
