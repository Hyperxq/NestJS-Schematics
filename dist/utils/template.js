'use strict';

var core = require('@angular-devkit/core');
var schematics = require('@angular-devkit/schematics');

const TEMPLATE_FILENAME_RE = /\.ejs$/;
const EXTENSION_FILES_ALLOW = [
    '.ejs',
    '.template'
];
function renameEJSFiles() {
    return renameExtensionFiles(TEMPLATE_FILENAME_RE);
}
function renameExtensionFiles(templateFilenameRe) {
    return schematics.forEach((entry)=>{
        if (entry.path.match(TEMPLATE_FILENAME_RE)) {
            return {
                content: entry.content,
                path: core.normalize(entry.path.replace(templateFilenameRe, ''))
            };
        } else {
            return entry;
        }
    });
}
function applyTemplates(options) {
    return schematics.forEach(schematics.when((path)=>EXTENSION_FILES_ALLOW.some((e)=>path.endsWith(e)), schematics.composeFileOperators([
        schematics.applyContentTemplate(options),
        // See above for this weird cast.
        schematics.applyPathTemplate(options),
        (entry)=>{
            return {
                content: entry.content,
                path: entry.path.replace(TEMPLATE_FILENAME_RE, '')
            };
        }
    ])));
}

exports.applyTemplates = applyTemplates;
exports.renameEJSFiles = renameEJSFiles;
exports.renameExtensionFiles = renameExtensionFiles;
