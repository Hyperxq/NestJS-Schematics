'use strict';

var inquirer = require('inquirer');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */ async function askConfirmation(message, defaultResponse) {
    const question = {
        type: 'confirm',
        name: 'confirmation',
        prefix: '',
        message,
        default: defaultResponse
    };
    const { prompt } = inquirer;
    const answers = await prompt([
        question
    ]);
    return answers['confirmation'];
}
async function askInput(options) {
    const { defaultValue, ...settings } = options;
    const question = {
        type: 'input',
        name: 'input',
        default: defaultValue,
        ...settings
    };
    const { prompt } = inquirer;
    const answers = await prompt([
        question
    ]);
    return answers['input'];
}
async function askList(message, choices, defaultValue) {
    const question = {
        type: 'list',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultValue
    };
    const { prompt } = inquirer;
    const answers = await prompt([
        question
    ]);
    return answers['answer'];
}
async function askQuestion(message, choices, defaultResponseIndex) {
    const question = {
        type: 'list',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultResponseIndex
    };
    const { prompt } = inquirer;
    const answers = await prompt([
        question
    ]);
    return answers['answer'];
}
async function askChoices(message, choices, defaultValue) {
    const question = {
        type: 'checkbox',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultValue
    };
    const { prompt } = inquirer;
    const answers = await prompt([
        question
    ]);
    return answers['answer'];
}

exports.askChoices = askChoices;
exports.askConfirmation = askConfirmation;
exports.askInput = askInput;
exports.askList = askList;
exports.askQuestion = askQuestion;
