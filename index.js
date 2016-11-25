var fs = require('fs');
var _u = require('underscore');
var Promise = require('es6-promise');
var program = require('commander');
var config = require('./config');

program
    .version('0.0.1')
    .usage('[options] <files ...>')

program
    .command('init [path]')
    .description('Create Microlink file structure on selected path')
    .option('-d, --discs <n>', 'Number of discs to create', parseInt)
    .action(function(path, options){
        path = path || '.';
        var discCount = 0;
        var i;

        if (!options.discs || options.discs >=  config.DISC_NAMES.length) {
            options.discs = config.DISC_NAMES.length;
        }

        for (i = 0; i < options.discs; i++) {
            var discPath = createPath(path, config.DISC_NAMES[i]);
            
            if(!fs.existsSync(discPath)) {
                fs.mkdirSync(discPath);
                discCount++;
            }
        }

        if (discCount) {
            console.log(discCount + " Micrlink drives created");
        } else {
            console.log("Microlink file structure already exist");
        }
    })

program
    .command('mix [path]')    
    .description('Mix supported music files in Microlink folders')
    .option('-r, --revert', 'Revert mixed files to original order')
    .action(function(path, options){

    });

program.parse(process.argv);

if (!program.args.length) {
    program.help();
} else {
    // console.log('Keywords: ' + program.args);
    // scanPath(program.args[0]);
}

//=================================================

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


function createPath(){
    var path = '';
    _u.forEach(arguments, function(arg){
        arg = arg.replace(/\/$/, '');
        path = path + '/' + arg;
    })
    return path.replace(/^\//, '');;
}
