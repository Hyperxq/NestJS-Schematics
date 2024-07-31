'use strict';

var core = require('@angular-devkit/core');
var schematics = require('@angular-devkit/schematics');
var ansiColors = require('ansi-colors');
var json5 = require('json5');
var builderGenerate_resource_questions_terminal = require('../builder-generate/resource/questions.terminal.js');
var utils_color = require('./color.js');

let schemasCache;
async function loadAndParseSchema({ sourceRoot }, tree, _context) {
    const schemas = getSchemas(tree, sourceRoot);
    if (schemas.length === 0) {
        console.log(utils_color.colors.bold(utils_color.colors.red('Schemas not found')));
        return;
    }
    const schema = await builderGenerate_resource_questions_terminal.ChooseSchemaQuestion(schemas.map((schema)=>({
            name: ansiColors.cyan(schema.schemaName),
            value: schema
        })));
    const { properties, schemaName, skipIndexes, path } = await getPropertiesFromSchema(schema);
    const { subSchemas, properties: propertiesUpdated } = await checkSubSchemas(path.replace('/files', ''), schemaName, properties, sourceRoot, tree);
    return {
        schema: {
            path: path.replace('/files', ''),
            name: schemaName.replace('Schema', '').toLowerCase(),
            properties: propertiesUpdated,
            skipIndexes
        },
        subSchemas
    };
}
function getSchemaFiles(tree, basePath) {
    const localSchemaFiles = tree.getDir(`${basePath}/schemas`).subfiles ?? [];
    const schemaFiles = [];
    if (localSchemaFiles.length > 0) {
        schemaFiles.push(...localSchemaFiles.map((fileName)=>({
                path: basePath,
                fileName
            })));
    }
    const subFolders = tree.getDir(basePath).subdirs;
    subFolders.forEach((sf)=>{
        schemaFiles.push(...getSchemaFiles(tree, core.normalize(`${basePath}/${sf}`)));
    });
    return schemaFiles;
}
async function getPropertiesFromSchema(schema, askIndexNotFound = true) {
    const { fileContent, schemaName, path } = schema;
    const properties = extractProperties(fileContent, schema.schemaName);
    const indexes = extractIndexes(fileContent, schemaName) ?? [];
    let skipIndexes = false;
    if (!indexes || indexes.length === 0) {
        if (askIndexNotFound) {
            console.log(utils_color.colors.bold(utils_color.colors.yellow('Indexes not found. Get dto uses indexes for its fields')));
            skipIndexes = await builderGenerate_resource_questions_terminal.AskForNotIndexesQuestion();
        } else {
            skipIndexes = true;
        }
    }
    for (const index of indexes){
        properties[index].isIndex = true;
    }
    return {
        path,
        schemaName: schema.schemaName,
        properties,
        skipIndexes
    };
}
function identifySchemas(schemaText) {
    const schemaMatches = [
        ...schemaText.matchAll(/\w+(?=\s*=\s*new\s*mongoose\.Schema)/gm)
    ];
    return schemaMatches.map((match)=>match[0]);
}
function extractProperties(schemaText, schemaName) {
    const pattern = new RegExp(`(?:${schemaName}\\.add\\(\\s*)([\\s\\S]+?)\\s*,*\\s*(?:'([\\S\\s]*?)'\\s*,*\\s*)*\\)`, 'm');
    const result = schemaText.match(pattern) ?? [];
    return result[1] ? parseObject(result[1]) : {};
}
function getSchemas(tree, sourceRoot) {
    if (schemasCache) {
        return schemasCache;
    }
    const schemaFiles = getSchemaFiles(tree, sourceRoot);
    const schemas = [];
    for (const { path, fileName } of schemaFiles){
        const filePath = `${path}/schemas/${fileName}`;
        const buffer = tree.read(filePath);
        const fileContent = buffer.toString('utf-8');
        schemas.push(...identifySchemas(fileContent).map((schemaName)=>({
                path,
                schemaName,
                fileContent
            })));
    }
    schemasCache = schemas;
    return schemasCache;
}
async function checkSubSchemas(schemaPath, schemaName, properties, sourceRoot, tree) {
    try {
        const propertiesCloned = core.deepCopy(properties);
        const subSchemasProperties = getNotMongooseProperties(properties);
        if (subSchemasProperties.length === 0 || subSchemasProperties === undefined) {
            return {
                subSchemas: [],
                properties
            };
        }
        const schemas = getSchemas(tree, sourceRoot);
        const subSchemas = [];
        for (const [propertyName, content] of subSchemasProperties){
            if (content.type === undefined) {
                throw new schematics.SchematicsException(`${propertyName} from ${schemaName} needs to have a type`);
            }
            const { type } = content;
            const schema = schemas.find((s)=>s.schemaName === type);
            if (!schema) {
                throw new schematics.SchematicsException(`${propertyName} is was detected like a sub-schema but no schema was found with the name: ${type}`);
            }
            // Removed the Schema type name with the named of the entity that we will create.
            propertiesCloned[propertyName].type = schema.schemaName.replace('Schema', '').toLowerCase();
            const { properties, schemaName: subSchemaName, skipIndexes, path } = await getPropertiesFromSchema(schema, false);
            // propertiesCloned[propertyName].importUrl = path;
            propertiesCloned[propertyName].importUrl = getRelativePath(schemaPath, schema.path);
            subSchemas.push({
                path,
                name: propertiesCloned[propertyName].type,
                properties,
                skipIndexes
            });
        }
        return {
            subSchemas,
            properties: propertiesCloned
        };
    } catch (e) {
        throw new schematics.SchematicsException(`Something happen when trying to check sub-schemas: ${e}`);
    }
}
function getRelativePath(from, to) {
    // If both paths are the same, return './'
    if (from === to) {
        return './';
    }
    // Step 1: Split both strings into arrays
    const fromParts = from.split('/');
    const toParts = to.split('/');
    // Step 2: Determine the common path length using a for loop
    let commonLength = 0;
    for(; commonLength < fromParts.length && commonLength < toParts.length; commonLength++){
        if (fromParts[commonLength] !== toParts[commonLength]) {
            break;
        }
    }
    const uniqueFromParts = fromParts.slice(commonLength);
    const uniqueToParts = toParts.slice(commonLength);
    // Step 3: Count the difference of folder between both
    const backSteps = uniqueToParts.length - 1; // subtract 1 as we don't count the file itself
    // Construct the relative path
    return backSteps === 0 ? './' : `${'../'.repeat(backSteps)}${uniqueFromParts.join('/')}`;
}
function getNotMongooseProperties(properties) {
    const primitiveTypes = [
        'String',
        'Number',
        'Date',
        'Buffer',
        'Boolean',
        'Array',
        'Decimal128',
        'Map',
        'UUID',
        'BigInt',
        'ObjectId',
        'Mixed'
    ];
    const entries = Object.entries(properties);
    return entries.filter(([key, content])=>primitiveTypes.find((pt)=>pt === content.type) === undefined);
}
function parseObject(value) {
    return json5.parse(value.replace(/(\w+)\s*:\s*(\w+)/gm, '"$1": "$2"') // Quote keys and string values
    .replace(/(\w+):\s*\{/gm, '"$1": {').replace(/"true"/g, 'true') // Revert quoting of true
    .replace(/"false"/g, 'false') // Revert quoting of false
    .replace(/[\n\s+]/gm, ''));
}
function extractIndexes(schemaText, schemaName) {
    const pattern = new RegExp(`(?:${schemaName}\\.index\\(\\s*)(\\{[\\s\\S]+?\\})\\s*,*\\s*(?:\\{[\\s\\S]+?\\}\\s*,*\\s*)*\\);`, 'gm');
    const result = [
        ...schemaText.matchAll(pattern) ?? []
    ];
    const indexArrayResult = result.map((str)=>parseObject(str[1]));
    const indexes = indexArrayResult.reduce((acc, obj)=>{
        Object.keys(obj).forEach((key)=>{
            acc.push(key);
        });
        return acc;
    }, []);
    return Array.from(new Set(indexes));
}

exports.loadAndParseSchema = loadAndParseSchema;
