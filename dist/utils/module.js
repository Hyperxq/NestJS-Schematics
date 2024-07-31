'use strict';

var schematics$1 = require('@angular-devkit/schematics');
var schematics = require('@nestjs/schematics');
var utils_module_finder = require('./module.finder.js');
var utils_parseName = require('./parse-name.js');

function addDeclarationToModule(options) {
    return (tree, _context)=>{
        const moduleOptions = transform(options);
        if (moduleOptions.skipImport !== undefined && moduleOptions.skipImport) {
            return tree;
        }
        moduleOptions.module = new utils_module_finder.ModuleFinder(tree).find({
            moduleName: moduleOptions.name,
            path: moduleOptions.sourceRoot
        });
        if (!moduleOptions.module) {
            return tree;
        }
        const content = tree.read(moduleOptions.module)?.toString();
        const declarator = new schematics.ModuleDeclarator();
        console.log(moduleOptions);
        tree.overwrite(moduleOptions.module, declarator.declare(content ?? '', {
            ...moduleOptions,
            type: 'module'
        }));
        return tree;
    };
}
function transform(options) {
    const target = Object.assign({}, options);
    if (!target.name) {
        throw new schematics$1.SchematicsException('Option (name) is required.');
    }
    target.metadata = 'imports';
    const { name, sourceRoot } = options;
    const location = utils_parseName.parseName(sourceRoot ?? '/', name);
    target.name = schematics.normalizeToKebabOrSnakeCase(location.name);
    target.path = schematics.normalizeToKebabOrSnakeCase(location.path);
    return target;
}

exports.addDeclarationToModule = addDeclarationToModule;
