'use strict';

var ansiColors = require('ansi-colors');
var utils_color = require('../../utils/color.js');
require('child_process');
require('../../utils/dependencies.js');
require('node:os');
require('@angular-devkit/core');
require('@angular-devkit/core/src/utils/strings');
require('@angular-devkit/schematics');
require('pluralize');
require('jsonc-parser');
require('json5');
require('@nestjs/schematics');
require('fs');
require('path');
var utils_prompt = require('../../utils/prompt.js');
require('@nestjs/cli/lib/compiler/helpers/get-value-or-default');
require('@nestjs/cli/lib/utils/load-configuration');
require('@nestjs/cli/lib/utils/project-utils');
require('ora');

async function ResourceQuestion() {
    const message = ansiColors.bold(ansiColors.green('What name would you like to use for this resource-old?'));
    return await utils_prompt.askInput({
        message
    });
}
async function ChooseFolderQuestion(folders) {
    if (folders.length === 0) {
        return '';
    }
    const message = ansiColors.bold(ansiColors.green('Which folder do you want to choose'));
    const choices = [
        ...folders,
        '[root]'
    ].map((folder)=>({
            name: ansiColors.cyan(folder),
            value: folder === '[root]' ? '' : folder
        }));
    return await utils_prompt.askList(message, choices, folders[0]);
}
async function ChooseSchemaQuestion(schemas) {
    const message = ansiColors.bold(ansiColors.green('Which schema do you want to choose'));
    return await utils_prompt.askList(message, schemas, schemas[0].value);
}
async function AskForNotIndexesQuestion() {
    const message = ansiColors.bold(utils_color.colors.green('Would you like to use all the properties instead indexes?'));
    return await utils_prompt.askConfirmation(message, false);
}

exports.AskForNotIndexesQuestion = AskForNotIndexesQuestion;
exports.ChooseFolderQuestion = ChooseFolderQuestion;
exports.ChooseSchemaQuestion = ChooseSchemaQuestion;
exports.ResourceQuestion = ResourceQuestion;
