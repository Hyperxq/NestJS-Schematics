'use strict';

var fs = require('fs');
var path = require('path');

function getRelativePath(currentPath) {
    const projectRoot = findProjectRoot() ?? process.cwd();
    return currentPath.replace(projectRoot, '') || '/';
}
function findProjectRoot(startPath = process.cwd(), fileToFind = 'package.json') {
    if (fs.existsSync(path.join(startPath, fileToFind))) {
        return startPath;
    }
    if (path.resolve(startPath, '..') === startPath) {
        throw new Error('Project root not found');
    }
    return findProjectRoot(path.resolve(startPath, '..'));
}

exports.findProjectRoot = findProjectRoot;
exports.getRelativePath = getRelativePath;
