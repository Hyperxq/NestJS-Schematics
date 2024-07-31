import { Path } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';

interface FindOptions {
    moduleName: string;
    path: Path;
    kind?: string;
}
declare class ModuleFinder {
    private tree;
    constructor(tree: Tree);
    find(options: FindOptions): Path | null;
    private findIn;
}

export { type FindOptions, ModuleFinder };
