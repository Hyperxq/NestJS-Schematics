'use strict';

var core = require('@angular-devkit/core');
var strings = require('@angular-devkit/core/src/utils/strings');
var schematics = require('@angular-devkit/schematics');
var pluralize = require('pluralize');
var utils_template = require('./template.js');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var pluralize__namespace = /*#__PURE__*/_interopNamespaceDefault(pluralize);

function addFilesToTree(options, urlToMove, urlTemplates, urlFiles = './files/ts') {
    const template = schematics.apply(schematics.url(urlFiles), [
        schematics.filter((path)=>urlTemplates.some((template)=>path.endsWith(template))),
        utils_template.applyTemplates({
            ...core.strings,
            ...options,
            lowercased: (name)=>{
                const classifiedName = strings.classify(name);
                return classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1);
            },
            singular: (name)=>pluralize__namespace.singular(name),
            plural: (name)=>pluralize__namespace.plural(name),
            ent: (name)=>name + '.entity'
        }),
        utils_template.renameEJSFiles(),
        schematics.renameTemplateFiles(),
        schematics.move(urlToMove)
    ]);
    return schematics.mergeWith(template, schematics.MergeStrategy.AllowCreationConflict);
}

exports.addFilesToTree = addFilesToTree;
