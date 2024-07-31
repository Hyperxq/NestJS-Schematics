import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { SchemaResult } from '../builder-generate/resource/resource.interfaces.js';
import { S as SchematicOptions } from '../resource.schema.d-9134c06b.js';
import '@angular-devkit/core';

declare function loadAndParseSchema({ sourceRoot }: SchematicOptions, tree: Tree, _context: SchematicContext): Promise<SchemaResult | undefined>;

export { loadAndParseSchema };
