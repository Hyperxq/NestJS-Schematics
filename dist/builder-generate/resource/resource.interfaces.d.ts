interface SchemaResult {
    schema: SchemaInfo;
    subSchemas: SchemaInfo[];
}
interface Schema {
    path: string;
    schemaName: string;
    fileContent: string;
}
interface SchemaInfo {
    path: string;
    name: string;
    properties: {
        [key: string]: any;
    };
    skipIndexes: boolean;
}
interface Properties {
    [key: string]: any;
}

export type { Properties, Schema, SchemaInfo, SchemaResult };
