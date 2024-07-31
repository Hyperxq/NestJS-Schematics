'use strict';

var utils_color = require('./color.js');
var utils_commands = require('./commands.js');
var utils_dependencies = require('./dependencies.js');
var utils_eol = require('./eol.js');
var utils_files = require('./files.js');
var utils_jsonFile = require('./json-file.js');
var utils_loadAndParseSchema = require('./loadAndParseSchema.js');
var utils_module_finder = require('./module.finder.js');
var utils_module = require('./module.js');
var utils_packageJson = require('./package-json.js');
var utils_parseName = require('./parse-name.js');
var utils_path = require('./path.js');
var utils_prompt = require('./prompt.js');
var utils_sourceRoot = require('./source-root.js');
var utils_spinner = require('./spinner.js');
var utils_template = require('./template.js');



exports.colors = utils_color.colors;
exports.removeColor = utils_color.removeColor;
exports.spawnAsync = utils_commands.spawnAsync;
Object.defineProperty(exports, 'NodeDependencyType', {
	enumerable: true,
	get: function () { return utils_dependencies.NodeDependencyType; }
});
exports.addPackageJsonDependency = utils_dependencies.addPackageJsonDependency;
exports.getPackageJsonDependency = utils_dependencies.getPackageJsonDependency;
exports.installDependencies = utils_dependencies.installDependencies;
exports.removePackageJsonDependency = utils_dependencies.removePackageJsonDependency;
exports.getEOL = utils_eol.getEOL;
exports.addFilesToTree = utils_files.addFilesToTree;
exports.JSONFile = utils_jsonFile.JSONFile;
exports.loadAndParseSchema = utils_loadAndParseSchema.loadAndParseSchema;
exports.ModuleFinder = utils_module_finder.ModuleFinder;
exports.addDeclarationToModule = utils_module.addDeclarationToModule;
exports.addElementToPackageJson = utils_packageJson.addElementToPackageJson;
exports.addScriptToPackageJson = utils_packageJson.addScriptToPackageJson;
exports.parseName = utils_parseName.parseName;
exports.findProjectRoot = utils_path.findProjectRoot;
exports.getRelativePath = utils_path.getRelativePath;
exports.askChoices = utils_prompt.askChoices;
exports.askConfirmation = utils_prompt.askConfirmation;
exports.askInput = utils_prompt.askInput;
exports.askList = utils_prompt.askList;
exports.askQuestion = utils_prompt.askQuestion;
exports.getSourceRoot = utils_sourceRoot.getSourceRoot;
exports.Spinner = utils_spinner.Spinner;
exports.applyTemplates = utils_template.applyTemplates;
exports.renameEJSFiles = utils_template.renameEJSFiles;
exports.renameExtensionFiles = utils_template.renameExtensionFiles;
