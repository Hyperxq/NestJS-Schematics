declare function getRelativePath(currentPath: string): string;
declare function findProjectRoot(startPath?: string, fileToFind?: string): string;

export { findProjectRoot, getRelativePath };
