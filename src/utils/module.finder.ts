import { Path, PathFragment, join } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface FindOptions {
  moduleName: string;
  path: Path;
  kind?: string;
}

export class ModuleFinder {
  constructor(private tree: Tree) {}

  public find(options: FindOptions): Path | null {
    const generatedDirectoryPath: Path = options.path;
    const generatedDirectory: DirEntry = this.tree.getDir(generatedDirectoryPath);

    return this.findIn(options.moduleName, generatedDirectory);
  }

  private findIn(moduleName: string, directory: DirEntry | null): Path | null {
    if (!directory) {
      return null;
    }
    const moduleFilename: PathFragment | undefined = directory.subfiles.find(
      (filename) =>
        /\.module\.([tj])s$/.test(filename) &&
        filename !== `${moduleName}.module.ts` &&
        filename !== `${moduleName}.module.js`,
    );

    return moduleFilename !== undefined
      ? join(directory.path, moduleFilename.valueOf())
      : this.findIn(moduleName, directory.parent);
  }
}

// {moduleFileName: string; modulePath: string} | null
