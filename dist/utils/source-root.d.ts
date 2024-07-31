interface Input {
    name: string;
    value: boolean | string;
    options?: any;
}
declare function getSourceRoot(inputs: Input[]): Promise<string>;

export { type Input, getSourceRoot };
