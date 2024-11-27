import { strings } from '@angular-devkit/core';
import * as pluralize from 'pluralize';

export function toSinglularClassify(name: string) {
  return pluralize.singular(strings.classify(name));
}
export function toSinglularDasherize(name: string) {
  return pluralize.singular(strings.dasherize(name));
}
