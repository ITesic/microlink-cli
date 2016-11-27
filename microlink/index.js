"use strict";

var fs = require('fs');
var _u = require('underscore');

var config = require('./config');
var stats = require('./stats');
var helpers = require('./helpers');

module.exports = {
    config: config,
    stats: stats,
    helpers: helpers,
    scanPath: scanPath,
    scanDisc: scanDisc,
    renameFiles: renameFiles,
    shuffleDisc: shuffleDisc,
    unshuffleDisc: unshuffleDisc
}

function scanPath(path) {
    var fileStructure = [];

    _u.forEach(fs.readdirSync(path), function(dir) {
        if (isValidDisc(dir)) {
            var discPath = helpers.createPath(path, dir);
            fileStructure.push({
                name: dir,
                number: helpers.parseDiscNumber(dir),
                path: discPath,
                files: scanDisc(discPath),
            });
        }
    });

    return fileStructure;
}

function scanDisc(discPath) {
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
        var oldPath = helpers.createPath(disc.path, disc.original.files[i]),
            newPath = helpers.createPath(disc.path, disc.files[i]);
        fs.renameSync(oldPath, newPath);
    };
}

function shuffleDisc(disc) {
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

function unshuffleDisc(disc) {
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
