'use strict';

var schematics = require('@angular-devkit/schematics');
var _interface = require('@angular-devkit/schematics/src/tree/interface');
require('../../utils/color.js');
require('child_process');
require('../../utils/dependencies.js');
require('node:os');
var utils_files = require('../../utils/files.js');
require('jsonc-parser');
var utils_loadAndParseSchema = require('../../utils/loadAndParseSchema.js');
require('@angular-devkit/core');
var utils_module = require('../../utils/module.js');
var utils_path = require('../../utils/path.js');
require('inquirer');
var utils_sourceRoot = require('../../utils/source-root.js');
require('ora');

function resourceFactory(options) {
    return async (tree, context)=>{
        const relativePath = utils_path.getRelativePath(process.cwd());
        if (relativePath === '/') {
            if (!options.sourceRoot) {
                console.log('Source Root not found');
                options.sourceRoot = await utils_sourceRoot.getSourceRoot([]);
            }
        } else {
            options.sourceRoot = '/';
        }
        const response = await utils_loadAndParseSchema.loadAndParseSchema(options, tree);
        if (!response) {
            return;
        }
        const { schema, subSchemas } = response;
        console.log(schema.name);
        console.log(`Does ${schema.name} have sub-schema: ${(subSchemas ?? []).length > 0}`);
        console.table(schema.properties);
        return schematics.branchAndMerge(schematics.chain([
            getSchemaRules(schema),
            getSubSchemaRules(subSchemas)
        ]), _interface.MergeStrategy.ContentOnly);
    };
}
function getSchemaRules(schema) {
    const { path, name, properties, skipIndexes } = schema;
    const propertyArray = Object.entries(properties);
    console.table(properties);
    return schematics.chain([
        addEntities({
            name,
            sourceRoot: path
        }, propertyArray),
        addDTOs({
            name,
            sourceRoot: path
        }, propertyArray, skipIndexes),
        addModule({
            name,
            sourceRoot: path
        }, propertyArray),
        addResolver({
            name,
            sourceRoot: path
        }, propertyArray),
        addService({
            name,
            sourceRoot: path
        }, propertyArray),
        addRepository({
            name,
            sourceRoot: path
        }, propertyArray),
        utils_module.addDeclarationToModule({
            name,
            sourceRoot: path
        })
    ]);
}
function getSubSchemaRules(subSchemas) {
    return schematics.chain(subSchemas.map(({ name, path, properties, skipIndexes })=>{
        return schematics.chain([
            addEntities({
                name,
                sourceRoot: path
            }, Object.entries(properties)),
            addDTOs({
                name,
                sourceRoot: path
            }, Object.entries(properties), skipIndexes)
        ]);
    }));
}
function addDTOs({ name, sourceRoot }, jsonOptions, skipIndexes = false) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions,
        skipIndexes
    }, `${sourceRoot}`, [
        'create-__name@singular@dasherize__.input.dto.ts.template',
        'get-__name@singular@dasherize__.input.dto.ts.template',
        'update-__name@singular@dasherize__.input.dto.ts.template'
    ], './files');
}
function addEntities({ name, sourceRoot }, jsonOptions) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions
    }, `${sourceRoot}`, [
        '__name@singular@dasherize@ent__.ts.template'
    ], './files');
}
function addModule({ name, sourceRoot }, jsonOptions) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions
    }, `${sourceRoot}`, [
        '__name@dasherize__.module.ts.template'
    ], './files');
}
function addResolver({ name, sourceRoot }, jsonOptions) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions
    }, `${sourceRoot}`, [
        '__name@singular@dasherize__.resolver.ts.template'
    ], './files');
}
function addService({ name, sourceRoot }, jsonOptions) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions
    }, `${sourceRoot}`, [
        '__name@singular@dasherize__.service.ts.template'
    ], './files');
}
function addRepository({ name, sourceRoot }, jsonOptions) {
    return utils_files.addFilesToTree({
        name,
        keys: jsonOptions
    }, `${sourceRoot}`, [
        '__name@singular@dasherize__.repository.ts.template'
    ], './files');
}

exports.resourceFactory = resourceFactory;
