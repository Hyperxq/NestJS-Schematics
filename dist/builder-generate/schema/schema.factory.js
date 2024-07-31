'use strict';

var schematics = require('@angular-devkit/schematics');
require('../../utils/color.js');
require('child_process');
require('../../utils/dependencies.js');
require('node:os');
var utils_files = require('../../utils/files.js');
require('jsonc-parser');
require('@angular-devkit/core');
require('ansi-colors');
require('json5');
require('@nestjs/schematics');
var utils_parseName = require('../../utils/parse-name.js');
var utils_path = require('../../utils/path.js');
require('inquirer');
var utils_sourceRoot = require('../../utils/source-root.js');
require('ora');
var builderGenerate_schema_questions_terminal = require('./questions.terminal.js');

function schemaFactory(options) {
    return async (_tree, _context)=>{
        if (utils_path.getRelativePath(process.cwd()) !== '/') {
            options.sourceRoot = '/';
        }
        if (!options.sourceRoot) {
            options.sourceRoot = await utils_sourceRoot.getSourceRoot([]);
        }
        if (!options.name) {
            do {
                options.name = await builderGenerate_schema_questions_terminal.SchemaQuestion();
            }while (!options.name)
        }
        const { path, name } = utils_parseName.parseName(options.sourceRoot, options.name);
        options.sourceRoot = path;
        options.name = name;
        return schematics.branchAndMerge(schematics.chain([
            addSchemaFile(options)
        ]));
    };
}
function addSchemaFile({ name, sourceRoot }) {
    return utils_files.addFilesToTree({
        name
    }, `${sourceRoot}`, [
        '__name@singular@dasherize__.schema.ts.template'
    ], './files');
}

exports.schemaFactory = schemaFactory;
