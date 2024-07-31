'use strict';

var ansiColors = require('ansi-colors');
require('../../utils/color.js');
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

async function SchemaQuestion() {
    const message = ansiColors.bold(ansiColors.green('What name would you like to use for this schema?'));
    return await utils_prompt.askInput({
        message
    });
}

exports.SchemaQuestion = SchemaQuestion;
