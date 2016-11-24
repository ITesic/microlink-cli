var fs = require('fs');
var _u = require('underscore');
var Promise = require('es6-promise');
var program = require('commander');
var config = require('./config');

program
    .version('0.0.1')
    .usage('[options] <files ...>')
    .option('-r, --randomize', 'Randomize files')
    .option('-c, --clean', 'Unrandomize files')
    .parse(process.argv);

if (!program.args.length) {
    program.help();
} else {
    console.log('Keywords: ' + program.args);
    scanPath(program.args[0]);
}

function scanPath(path) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(err, dirs) {
            if (err) {
                reject(err);
                return;
            }
            for (var i = 0; i < dirs.length; i++) {
                if (isValidDisc(dirs[i])) {
                    var discPath = path + '/' + dirs[i];
                    scanDisc(discPath);
                }
            }
        });
    });
}

function renameFiles(oldFiles, newFiles, dir) {
    return new Promise(function(resolve, reject) {

        if (oldFiles.length != newFiles.length) {
            throw new Error("Old files and new files lists are different!");
        }

        for (var i = 0; i < oldFiles.length; i++) {
            var oldPath = dir + '/' + oldFiles[i];
            var newPath = dir + '/' + newFiles[i];

            fs.rename(oldPath, newPath, function(err) {
                if (err) {
                    reject(err)
                }
                resolve();
            });
        }
    });
}

function randomizeMusicFiles(files) {
    files = filterMusicFiles(files);

    var randomizer = _u.range(files.length);
    randomizer = _u.shuffle(randomizer);

    return _u.map(files, function(file, i) {
        return randomizer[i] + '__' + file;
    });
}

function unrandomizeMusicFiles(files) {
    files = filterMusicFiles(files);
    var regex = /(\d+__)/g;

    return _u.map(files, function(file) {
        return file.replace(regex, '');
    });
}

function isValidDisc(disc) {
    return _u.contains(config.DISC_NAMES, disc);
}

function filterMusicFiles(files) {
    //TODO implement filter
    _u.filter(files, function(file) {

    });
    return files;
}

function scanDisc(discPath, callback) {
    return new Promise(function(resolve, reject) {
        fs.readdir(discPath, function(err, files) {
            if (err) {
                reject(err);
                return;
            }

            var newFiles = [];

            if (program.randomize) {
                newFiles = randomizeMusicFiles(files);
            }
            if (program.clean) {
                newFiles = unrandomizeMusicFiles(files);
            }
            return renameFiles(files, newFiles, discPath)
                .then(function() {
                    console.log('Files in ' + discPath + ' are renamed')
                })
                .catch(function(e) {
                    console.error(e)
                });
        });
    })

}
