'use strict';

var getValueOrDefault = require('@nestjs/cli/lib/compiler/helpers/get-value-or-default');
var loadConfiguration = require('@nestjs/cli/lib/utils/load-configuration');
var projectUtils = require('@nestjs/cli/lib/utils/project-utils');

const schematicName = 'nest-add';
async function getSourceRoot(inputs) {
    const configuration = await loadConfiguration.loadConfiguration();
    const configurationProjects = configuration.projects;
    const appName = inputs.find((option)=>option?.name === 'project')?.value;
    let sourceRoot = appName ? getValueOrDefault.getValueOrDefault(configuration, 'sourceRoot', appName) : configuration.sourceRoot;
    const shouldAsk = projectUtils.shouldAskForProject(schematicName, configurationProjects, appName);
    if (shouldAsk) {
        const defaultLabel = ' [ Default ]';
        let defaultProjectName = configuration.sourceRoot + defaultLabel;
        for(const property in configurationProjects){
            if (configurationProjects[property].sourceRoot === configuration.sourceRoot) {
                defaultProjectName = property + defaultLabel;
                break;
            }
        }
        const projects = projectUtils.moveDefaultProjectToStart(configuration, defaultProjectName, defaultLabel);
        const answers = await projectUtils.askForProjectName('Which project would you like to add the library to?', projects);
        const project = answers.appName.replace(defaultLabel, '');
        if (project !== configuration.sourceRoot) {
            sourceRoot = configurationProjects[project].sourceRoot;
        }
    }
    return sourceRoot;
}

exports.getSourceRoot = getSourceRoot;
