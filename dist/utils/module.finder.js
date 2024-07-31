'use strict';

var core = require('@angular-devkit/core');

class ModuleFinder {
    find(options) {
        const generatedDirectoryPath = options.path;
        const generatedDirectory = this.tree.getDir(generatedDirectoryPath);
        return this.findIn(options.moduleName, generatedDirectory);
    }
    findIn(moduleName, directory) {
        if (!directory) {
            return null;
        }
        const moduleFilename = directory.subfiles.find((filename)=>/\.module\.([tj])s$/.test(filename) && filename !== `${moduleName}.module.ts` && filename !== `${moduleName}.module.js`);
        return moduleFilename !== undefined ? core.join(directory.path, moduleFilename.valueOf()) : this.findIn(moduleName, directory.parent);
    }
    constructor(tree){
        this.tree = tree;
    }
} // {moduleFileName: string; modulePath: string} | null

exports.ModuleFinder = ModuleFinder;
