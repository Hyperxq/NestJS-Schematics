declare function ResourceQuestion(): Promise<string>;
declare function ChooseFolderQuestion(folders: string[]): Promise<string>;
declare function ChooseSchemaQuestion<T = string>(schemas: {
    name: string;
    value: T;
}[]): Promise<T>;
declare function AskForNotIndexesQuestion(): Promise<boolean>;

export { AskForNotIndexesQuestion, ChooseFolderQuestion, ChooseSchemaQuestion, ResourceQuestion };
